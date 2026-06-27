import axios from "axios";
import { db } from "../../database/mysql.js";
import { AppError } from "../../common/api-error.js";
import crypto from "crypto";
import { env, getApiBaseUrl } from "../../config/env.js";
import { createModuleLogger } from "../../utils/logger.js";
import { generateIdempotencyKey } from "../../utils/crypto.js";
import { ORDER_STATUS, PAYMENT_STATUS } from "../../config/constants.js";
import { emailService } from "../../services/email.service.js";

const log = createModuleLogger("payment-service");

/** Helper to send order email confirmation asynchronously */
async function sendOrderConfirmation(orderId: bigint) {
  try {
    const order = await db.select("orders", "*", "id = ?", [orderId]);
    if (order) {
      const user = await db.select("users", "*", "id = ?", [order.user_id]);
      if (user) {
        await emailService.sendOrderConfirmationEmail(
          user.email,
          order.order_number,
          Number(order.total_amount),
        );
      }
    }
  } catch (err) {
    log.error({ err, orderId: Number(orderId) }, "Failed to send order confirmation email");
  }
}

export const paymentService = {
  /**
   * Create a Cashfree payment session for an order.
   */
  async createSession(userId: string, orderId: number) {
    const order = await db.select("orders", "*", "id = ? AND user_id = ? AND deleted_at IS NULL", [BigInt(orderId), userId]);

    if (!order) throw AppError.notFound("Order");

    if (order.status !== ORDER_STATUS.PENDING) {
      throw AppError.badRequest(`Order is in status: ${order.status}`);
    }

    const user = await db.select("users", "*", "id = ?", [userId]);
    if (!user) throw AppError.notFound("User");

    const amount = Number(order.total_amount);
    const cfOrderId = `CF_ORD_${order.order_number}`;
    const idempotencyKey = generateIdempotencyKey();

    // Check if a payment record already exists for this order
    let payment: any = await db.select(
      "payments",
      "*",
      "order_id = ? AND status = ?",
      [order.id, PAYMENT_STATUS.INITIATED]
    );

    if (!payment) {
      const insertRes = await db.insert("payments", {
        order_id: order.id,
        provider: "CASHFREE",
        provider_order_id: cfOrderId,
        status: PAYMENT_STATUS.INITIATED,
        amount,
        currency: "INR",
        idempotency_key: idempotencyKey,
      });

      payment = {
        id: BigInt(insertRes.insertId),
        order_id: order.id,
        provider: "CASHFREE",
        provider_order_id: cfOrderId,
        status: PAYMENT_STATUS.INITIATED,
        amount,
        currency: "INR",
        idempotency_key: idempotencyKey,
      };
    }

    // Cashfree payload
    const payload = {
      order_id: cfOrderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
        customer_name: user.fullName,
        customer_email: user.email,
        customer_phone: user.phone ?? "9999999999", // fallback for sandboxing
      },
      order_meta: {
        return_url: `${env.CORS_ORIGIN}/payment/verify?order_id=${cfOrderId}&merchant_order_id=${orderId}`,
        notify_url: `${getApiBaseUrl()}${env.API_PREFIX}/payments/webhook`,
      },
    };

    // If sandbox config is dummy/unset, bypass Cashfree API and return a mock link for development
    if (env.CASHFREE_APP_ID === "change_me" || env.CASHFREE_SECRET_KEY === "change_me") {
      log.warn("Cashfree keys not configured. Falling back to local offline mock payment flow.");
      const mockSession = {
        cf_order_id: cfOrderId,
        payment_session_id: `mock_session_${Date.now()}`,
        payment_link: `${env.CORS_ORIGIN}/payment/verify?order_id=${cfOrderId}&merchant_order_id=${orderId}&mock_success=true`,
      };

      await db.update("payments", {
        payload: JSON.stringify(mockSession),
      }, "id = ?", [BigInt(payment!.id)]);

      return mockSession;
    }

    try {
      const response = await axios.post(
        `${env.CASHFREE_BASE_URL}/pg/orders`,
        payload,
        {
          headers: {
            "x-client-id": env.CASHFREE_APP_ID,
            "x-client-secret": env.CASHFREE_SECRET_KEY,
            "x-api-version": "2023-08-01",
            "Content-Type": "application/json",
            "x-idempotency-key": idempotencyKey,
          },
        },
      );

      const data = response.data;

      await db.update("payments", {
        payload: JSON.stringify(data),
      }, "id = ?", [BigInt(payment!.id)]);

      return {
        cf_order_id: data.cf_order_id,
        payment_session_id: data.payment_session_id,
        payment_link: data.payment_link || null,
      };
    } catch (err: any) {
      log.error({ err: err.response?.data || err.message }, "Cashfree order creation failed");
      throw AppError.internal("Failed to initiate payment gateway session");
    }
  },

  /**
   * Verify Cashfree payment for an order.
   */
  async verifyPayment(userId: string, orderId: number, cfOrderId: string) {
    const order = await db.select("orders", "*", "id = ? AND user_id = ? AND deleted_at IS NULL", [BigInt(orderId), userId]);
    if (!order) throw AppError.notFound("Order");

    const payment = await db.select("payments", "*", "order_id = ? AND provider_order_id = ?", [order.id, cfOrderId]);
    if (!payment) throw AppError.notFound("Payment log");

    // If it's already success, skip checks
    if (payment.status === PAYMENT_STATUS.SUCCESS) {
      return { success: true, status: order.status };
    }

    // Mock fallback handler
    if (env.CASHFREE_APP_ID === "change_me" || env.CASHFREE_SECRET_KEY === "change_me") {
      log.info("Verifying mock payment flow (success auto-assumed)");
      await db.transaction(async (conn) => {
        await db.update("payments", { status: PAYMENT_STATUS.SUCCESS }, "id = ?", [BigInt(payment.id)], false, conn);
        await db.update("orders", { status: ORDER_STATUS.PAID }, "id = ?", [order.id], false, conn);
      });

      sendOrderConfirmation(order.id);

      return { success: true, status: ORDER_STATUS.PAID };
    }

    try {
      const response = await axios.get(
        `${env.CASHFREE_BASE_URL}/pg/orders/${cfOrderId}`,
        {
          headers: {
            "x-client-id": env.CASHFREE_APP_ID,
            "x-client-secret": env.CASHFREE_SECRET_KEY,
            "x-api-version": "2023-08-01",
          },
        },
      );

      const status = response.data.order_status; // PAID, ACTIVE, EXPIRED

      if (status === "PAID") {
        await db.transaction(async (conn) => {
          await db.update("payments", { status: PAYMENT_STATUS.SUCCESS }, "id = ?", [BigInt(payment.id)], false, conn);
          await db.update("orders", { status: ORDER_STATUS.PAID }, "id = ?", [order.id], false, conn);
        });

        sendOrderConfirmation(order.id);

        return { success: true, status: ORDER_STATUS.PAID };
      } else {
        await db.update("payments", { status: PAYMENT_STATUS.FAILED }, "id = ?", [BigInt(payment.id)]);
        return { success: false, status: order.status };
      }
    } catch (err: any) {
      log.error({ err: err.response?.data || err.message }, "Cashfree order verification failed");
      throw AppError.internal("Failed to verify payment with gateway");
    }
  },

  /**
   * Process incoming Webhooks from Cashfree.
   */
  async processWebhook(payload: any, signature: string) {
    if (env.CASHFREE_SECRET_KEY !== "change_me" && signature) {
      const expected = crypto
        .createHmac("sha256", env.CASHFREE_SECRET_KEY)
        .update(JSON.stringify(payload))
        .digest("base64");
      if (signature !== expected) {
        log.warn("Cashfree webhook signature mismatch");
        throw AppError.unauthorized("Invalid webhook signature");
      }
    }

    await db.insert("webhook_logs", {
      provider: "CASHFREE",
      event: payload.event || "UNKNOWN",
      signature,
      payload: JSON.stringify(payload),
    });

    // TODO: Verify Cashfree webhook signature using client secret if configured
    // For now we parse order details
    const cfOrderId = payload.data?.order?.order_id;
    if (!cfOrderId) return;

    const payment = await db.select("payments", "*", "provider_order_id = ?", [cfOrderId]);
    if (!payment) return;

    const eventType = payload.event;
    if (eventType === "ORDER_PAID") {
      await db.transaction(async (conn) => {
        await db.update("payments", { status: PAYMENT_STATUS.SUCCESS }, "id = ?", [BigInt(payment.id)], false, conn);
        await db.update("orders", { status: ORDER_STATUS.PAID }, "id = ?", [BigInt(payment.order_id)], false, conn);
      });

      sendOrderConfirmation(BigInt(payment.order_id));

      log.info({ orderId: Number(payment.order_id) }, "Order PAID via Webhook");
    } else if (eventType === "PAYMENT_FAILED") {
      await db.update("payments", { status: PAYMENT_STATUS.FAILED }, "id = ?", [BigInt(payment.id)]);
      log.info({ orderId: Number(payment.order_id) }, "Payment FAILED via Webhook");
    }
  },
};

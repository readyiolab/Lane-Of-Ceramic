import axios from "axios";
import { db } from "../../database/mysql.js";
import { redis } from "../../database/redis.js";
import { AppError } from "../../common/api-error.js";
import { env } from "../../config/env.js";
import { createModuleLogger } from "../../utils/logger.js";
import { ORDER_STATUS, SHIPMENT_STATUS } from "../../config/constants.js";
import { smsService } from "../../services/sms.service.js";

const log = createModuleLogger("shipment-service");

/** Helper to send shipping update SMS asynchronously */
async function sendShippingNotification(shipmentId: bigint) {
  try {
    const shipment = await db.select("shipments", "*", "id = ?", [shipmentId]);
    if (shipment && shipment.awb_code) {
      const order = await db.select("orders", "*", "id = ?", [BigInt(shipment.order_id)]);
      if (order) {
        const address = await db.select("addresses", "*", "id = ?", [BigInt(order.address_id)]);
        const user = await db.select("users", "*", "id = ?", [order.user_id]);
        const phone = address?.mobile_number || user?.phone;
        if (phone) {
          await smsService.sendShippingUpdateSMS(
            phone,
            order.order_number,
            shipment.awb_code,
            shipment.tracking_url || `https://track.shiprocket.in/${shipment.awb_code}`,
          );
        }
      }
    }
  } catch (err) {
    log.error({ err, shipmentId: Number(shipmentId) }, "Failed to send shipping SMS notification");
  }
}

export const shipmentService = {
  /**
   * Authenticate with Shiprocket and return token. Caches token in Redis.
   */
  async getAuthToken(): Promise<string | null> {
    if (env.SHIPROCKET_EMAIL === "change_me" || env.SHIPROCKET_PASSWORD === "change_me") {
      return null;
    }

    const cacheKey = "shiprocket:token";
    const cachedToken = await redis.get(cacheKey);
    if (cachedToken) return cachedToken;

    try {
      const response = await axios.post(`${env.SHIPROCKET_BASE_URL}/v1/external/auth/login`, {
        email: env.SHIPROCKET_EMAIL,
        password: env.SHIPROCKET_PASSWORD,
      });

      const token = response.data.token;
      // Cache token for 24 hours (Shiprocket token is valid for 10 days)
      await redis.set(cacheKey, token, "EX", 24 * 60 * 60);
      return token;
    } catch (err: any) {
      log.error(
        { err: err.response?.data || err.message },
        "Shiprocket login authentication failed",
      );
      return null;
    }
  },

  /**
   * Create a shipment in Shiprocket for a paid order.
   */
  async createShipment(orderId: number) {
    const order = await db.select("orders", "*", "id = ? AND deleted_at IS NULL", [BigInt(orderId)]);

    if (!order) throw AppError.notFound("Order");

    if (order.status !== ORDER_STATUS.PAID) {
      throw AppError.badRequest("Order must be paid before booking shipment");
    }

    const user = await db.select("users", "*", "id = ?", [order.user_id]);
    if (!user) throw AppError.notFound("User");

    // Fetch order items with joined product info
    const items = await db.queryAll(
      `SELECT oi.*, p.name as product_name, p.sku as product_sku, p.weight as product_weight
       FROM ec_order_items oi
       JOIN ec_products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [order.id]
    );

    // Retrieve shipping address details
    const address = await db.select("addresses", "*", "id = ?", [BigInt(order.address_id)]);
    if (!address) throw AppError.notFound("Delivery Address");

    // Check if shipment record already exists
    let shipment = await db.select("shipments", "*", "order_id = ?", [order.id]);

    if (shipment) {
      throw AppError.badRequest("Shipment already initiated for this order");
    }

    // Build Shiprocket payload
    const orderItemsPayload = items.map((item) => ({
      name: item.product_name,
      sku: item.product_sku,
      units: item.quantity,
      selling_price: Number(item.unit_price),
    }));

    const totalWeight = items.reduce(
      (sum, item) => sum + (parseFloat(item.product_weight || "0.5") * item.quantity),
      0,
    );

    const payload = {
      order_id: `SR_ORD_${order.order_number}`,
      order_date: new Date(order.created_at).toISOString().slice(0, 19).replace("T", " "),
      pickup_location: "Primary Warehouse", // Must match pickup location in Shiprocket panel
      billing_customer_name: address.fullName,
      billing_last_name: "",
      billing_address: address.address_line_1,
      billing_address_2: address.address_line_2 || "",
      billing_city: address.city,
      billing_pincode: address.pincode,
      billing_state: address.state,
      billing_country: address.country,
      billing_email: address.email || user.email,
      billing_phone: address.mobile_number,
      shipping_is_billing: true,
      order_items: orderItemsPayload,
      payment_method: "Prepaid",
      sub_total: Number(order.subtotal),
      length: 10, // dummy pkg dimensions
      width: 10,
      height: 10,
      weight: totalWeight || 0.5,
    };

    const token = await this.getAuthToken();

    // Fallback if Shiprocket keys not set
    if (!token) {
      log.warn("Shiprocket not configured. Falling back to offline mock shipment creation.");
      const mockAwb = `AWB_${Math.floor(1000000000 + Math.random() * 9000000000)}`;

      const mockShipment = await db.transaction(async (conn) => {
        const insertRes = await db.insert("shipments", {
          order_id: order.id,
          provider: "SHIPROCKET",
          provider_order_id: `SR_MOCK_${order.order_number}`,
          awb_code: mockAwb,
          status: SHIPMENT_STATUS.CREATED,
          tracking_url: "https://track.shiprocket.in/mock-tracking",
          payload: JSON.stringify(payload),
        }, false, conn);

        await db.update("orders", { status: ORDER_STATUS.PROCESSING }, "id = ?", [order.id], false, conn);

        return {
          id: BigInt(insertRes.insertId),
          providerOrderId: `SR_MOCK_${order.order_number}`,
          awbCode: mockAwb,
          status: SHIPMENT_STATUS.CREATED,
        };
      });

      sendShippingNotification(mockShipment.id);

      return {
        id: Number(mockShipment.id),
        providerOrderId: mockShipment.providerOrderId,
        awbCode: mockShipment.awbCode,
        status: mockShipment.status,
      };
    }

    try {
      const response = await axios.post(
        `${env.SHIPROCKET_BASE_URL}/v1/external/orders/create/adhoc`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = response.data;
      const providerOrderId = String(data.order_id);

      // Create local shipment tracker and update order in a transaction
      const newShipment = await db.transaction(async (conn) => {
        const insertRes = await db.insert("shipments", {
          order_id: order.id,
          provider: "SHIPROCKET",
          provider_order_id: providerOrderId,
          status: SHIPMENT_STATUS.CREATED,
          payload: JSON.stringify(data),
        }, false, conn);

        await db.update("orders", { status: ORDER_STATUS.PROCESSING }, "id = ?", [order.id], false, conn);

        return {
          id: BigInt(insertRes.insertId),
          providerOrderId,
          status: SHIPMENT_STATUS.CREATED,
        };
      });

      log.info({ shipmentId: Number(newShipment.id) }, "Shiprocket shipment created");

      return {
        id: Number(newShipment.id),
        providerOrderId,
        status: newShipment.status,
      };
    } catch (err: any) {
      log.error({ err: err.response?.data || err.message }, "Shiprocket shipment creation failed");
      throw AppError.internal("Failed to create shipment order in Shiprocket");
    }
  },

  /**
   * Assign AWB and book courier (Admin command / webhook).
   */
  async assignAwbAndBook(shipmentId: number, courierId: number) {
    const shipment = await db.select("shipments", "*", "id = ?", [BigInt(shipmentId)]);
    if (!shipment) throw AppError.notFound("Shipment");

    const token = await this.getAuthToken();
    if (!token) {
      // Mock update
      const awbCode = `AWB_${Date.now()}`;
      await db.update("shipments", {
        awb_code: awbCode,
        tracking_url: "https://shiprocket.co/track/mock",
        status: SHIPMENT_STATUS.PICKUP_BOOKED,
      }, "id = ?", [BigInt(shipmentId)]);

      sendShippingNotification(BigInt(shipmentId));
      return;
    }

    try {
      // 1. Assign AWB
      const awbResponse = await axios.post(
        `${env.SHIPROCKET_BASE_URL}/v1/external/courier/assign/awb`,
        {
          shipment_id: shipment.provider_order_id,
          courier_id: courierId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const awbCode = awbResponse.data.response.data.awb_code;

      // 2. Request pickup
      await axios.post(
        `${env.SHIPROCKET_BASE_URL}/v1/external/courier/generate/pickup`,
        {
          shipment_id: [shipment.provider_order_id],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      await db.update("shipments", {
        awb_code: awbCode,
        tracking_url: `https://track.shiprocket.in/${awbCode}`,
        status: SHIPMENT_STATUS.PICKUP_BOOKED,
      }, "id = ?", [BigInt(shipmentId)]);

      sendShippingNotification(BigInt(shipmentId));

      log.info({ shipmentId, awbCode }, "AWB assigned and pickup booked");
    } catch (err: any) {
      log.error({ err: err.response?.data || err.message }, "Shiprocket AWB booking failed");
      throw AppError.internal("Failed to assign AWB or schedule shipment pickup");
    }
  },

  /**
   * Process incoming Webhooks from Shiprocket (tracking events).
   */
  async processWebhook(payload: any) {
    // Log raw event
    await db.insert("webhook_logs", {
      provider: "SHIPROCKET",
      event: payload.current_status || "UNKNOWN",
      payload: JSON.stringify(payload),
    });

    const awbCode = payload.awb;
    if (!awbCode) return;

    const shipment = await db.select("shipments", "*", "awb_code = ?", [awbCode]);
    if (!shipment) return;

    const currentStatus = payload.current_status.toUpperCase();
    let newStatus = shipment.status;
    let orderStatus: string = ORDER_STATUS.PROCESSING;

    // Map Shiprocket statuses to local DB enums
    if (currentStatus.includes("PICKED UP") || currentStatus.includes("IN TRANSIT")) {
      newStatus = SHIPMENT_STATUS.IN_TRANSIT;
      orderStatus = ORDER_STATUS.SHIPPED;
    } else if (currentStatus.includes("DELIVERED")) {
      newStatus = SHIPMENT_STATUS.DELIVERED;
      orderStatus = ORDER_STATUS.DELIVERED;
    } else if (currentStatus.includes("CANCELLED")) {
      newStatus = SHIPMENT_STATUS.CANCELLED;
      orderStatus = ORDER_STATUS.CANCELLED;
    } else if (currentStatus.includes("RTO")) {
      newStatus = SHIPMENT_STATUS.RTO;
    }

    await db.transaction(async (conn) => {
      await db.update("shipments", { status: newStatus }, "id = ?", [BigInt(shipment.id)], false, conn);
      await db.update("orders", { status: orderStatus }, "id = ?", [BigInt(shipment.order_id)], false, conn);
    });

    if (newStatus === SHIPMENT_STATUS.IN_TRANSIT) {
      sendShippingNotification(BigInt(shipment.id));
    }

    log.info(
      { shipmentId: Number(shipment.id), currentStatus, mappedStatus: newStatus },
      "Shipment updated via webhook",
    );
  },
};

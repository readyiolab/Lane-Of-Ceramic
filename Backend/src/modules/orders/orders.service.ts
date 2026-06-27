import { db } from "../../database/mysql.js";
import { AppError } from "../../common/api-error.js";
import { cartService } from "../cart/cart.service.js";
import { generateOrderNumber } from "../../utils/crypto.js";
import { ORDER_STATUS, COD_SURCHARGE, ORDER_STATUS_TRANSITIONS } from "../../config/constants.js";
import type { OrderStatusType } from "../../config/constants.js";
import { createModuleLogger } from "../../utils/logger.js";
import { parsePagination } from "../../utils/pagination.js";
import { emailService } from "../../services/email.service.js";
import { smsService } from "../../services/sms.service.js";
import { env } from "../../config/env.js";

const log = createModuleLogger("order-service");

export const orderService = {
  /**
   * Place a new order from cart.
   */
  async placeOrder(
    userId: string,
    input: {
      addressId: number;
      paymentMethod: "COD" | "ONLINE";
      couponCode?: string | null;
    },
  ) {
    // 1. Verify address
    const address = await db.select(
      "addresses",
      "*",
      "id = ? AND user_id = ? AND deleted_at IS NULL",
      [BigInt(input.addressId), userId]
    );
    if (!address) throw AppError.badRequest("Invalid delivery address");

    // 2. Fetch cart summary
    const cartSummary = await cartService.getCartSummary(userId, null);
    if (cartSummary.items.length === 0) {
      throw AppError.badRequest("Cart is empty");
    }

    // Double check stock availability before opening transaction
    for (const item of cartSummary.items) {
      if (!item.inStock || item.stockCount < item.quantity) {
        throw AppError.insufficientStock(item.name);
      }
    }

    let subtotal = cartSummary.subtotal;
    let discountAmount = cartSummary.discountAmount; // from tiers
    let shippingAmount = cartSummary.shippingFee;
    let taxAmount = 0; // GST or other tax if applicable (can be 0 or calculated)

    // 3. Handle Coupon if provided
    let couponId: bigint | null = null;
    let couponDiscount = 0;

    if (input.couponCode) {
      const now = new Date();
      const coupon = await db.select(
        "coupons",
        "*",
        "code = ? AND isActive = true AND (starts_at IS NULL OR starts_at <= ?) AND (expires_at IS NULL OR expires_at >= ?)",
        [input.couponCode.toUpperCase(), now, now]
      );

      if (!coupon) {
        throw AppError.badRequest("Invalid or expired coupon code");
      }

      if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
        throw AppError.badRequest("Coupon usage limit exceeded");
      }

      if (coupon.min_order_value !== null && subtotal < Number(coupon.min_order_value)) {
        throw AppError.badRequest(
          `Minimum order value for this coupon is INR ${coupon.min_order_value}`,
        );
      }

      // Calculate coupon discount
      if (coupon.discount_type === "PERCENTAGE") {
        couponDiscount = (subtotal * Number(coupon.discount_value)) / 100;
        if (coupon.max_discount !== null) {
          couponDiscount = Math.min(couponDiscount, Number(coupon.max_discount));
        }
      } else {
        // FIXED
        couponDiscount = Number(coupon.discount_value);
      }

      couponId = BigInt(coupon.id);
      discountAmount += couponDiscount;
    }

    // Add COD surcharge if applicable
    if (input.paymentMethod === "COD") {
      shippingAmount += COD_SURCHARGE;
    }

    const totalAmount = Math.max(0, subtotal - discountAmount + shippingAmount + taxAmount);
    const orderNumber = generateOrderNumber();

    // 4. Run database transaction to commit order and adjust inventory
    const order = await db.transaction(async (conn) => {
      // Create Order
      const insertOrderResult = await db.insert("orders", {
        order_number: orderNumber,
        user_id: userId,
        address_id: BigInt(input.addressId),
        status: ORDER_STATUS.PENDING,
        subtotal,
        discount_amount: discountAmount,
        shipping_amount: shippingAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        coupon_id: couponId,
      }, false, conn);

      const orderId = BigInt(insertOrderResult.insertId);

      // Create Order Items and update product stock
      for (const item of cartSummary.items) {
        await db.insert("order_items", {
          order_id: orderId,
          product_id: BigInt(item.productId),
          variant_id: item.variantId ? BigInt(item.variantId) : null,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          line_total: item.unitPrice * item.quantity,
        }, false, conn);

        // Deduct Variant Stock if variant selected
        if (item.variantId) {
          const variant = await db.select("product_variants", "*", "id = ?", [BigInt(item.variantId)], false, conn);
          if (!variant || variant.stock_count < item.quantity) {
            throw AppError.insufficientStock(`${item.name} (Variant)`);
          }

          await db.update("product_variants", {
            stock_count: variant.stock_count - item.quantity
          }, "id = ?", [BigInt(item.variantId)], false, conn);

          // Log Variant Inventory
          await db.insert("inventory_logs", {
            product_id: BigInt(item.productId),
            variant_id: BigInt(item.variantId),
            change_type: "ORDER_DECREMENT",
            quantity: -item.quantity,
            reason: `Order ${orderNumber} placed`,
          }, false, conn);
        }

        // Deduct Master Product Stock
        const product = await db.select("products", "*", "id = ?", [BigInt(item.productId)], false, conn);
        if (!product || product.stock_count < item.quantity) {
          throw AppError.insufficientStock(item.name);
        }

        const newStock = product.stock_count - item.quantity;
        await db.update("products", {
          stock_count: newStock,
          in_stock: newStock > 0 ? 1 : 0
        }, "id = ?", [BigInt(item.productId)], false, conn);

        // Log Master Inventory
        await db.insert("inventory_logs", {
          product_id: BigInt(item.productId),
          change_type: "ORDER_DECREMENT",
          quantity: -item.quantity,
          reason: `Order ${orderNumber} placed`,
        }, false, conn);
      }

      // If coupon used, increment use count
      if (couponId) {
        const coupon = await db.select("coupons", "used_count", "id = ?", [couponId], false, conn);
        const newUsedCount = (coupon?.used_count || 0) + 1;
        await db.update("coupons", {
          used_count: newUsedCount
        }, "id = ?", [couponId], false, conn);
      }

      // Clear User Cart
      const cart = await db.select("carts", "id", "user_id = ?", [userId], false, conn);
      if (cart) {
        await db.delete("cart_items", "cart_id = ?", [BigInt(cart.id)], false, conn);
      }

      return {
        id: orderId,
        orderNumber,
        totalAmount,
        status: ORDER_STATUS.PENDING
      };
    });

    log.info({ orderId: Number(order.id), orderNumber }, "Order placed successfully");

    // Send instant confirmation for COD orders
    if (input.paymentMethod === "COD") {
      db.select("users", "email, fullName, phone", "id = ?", [userId]).then((user) => {
        if (user) {
          emailService
            .sendOrderConfirmationEmail(user.email, orderNumber, totalAmount)
            .catch((err) => log.error({ err }, "COD order confirmation email failed"));

          if (user.phone) {
            smsService
              .sendSMS(
                user.phone,
                `Your order ${orderNumber} of INR ${totalAmount.toFixed(2)} is placed successfully (COD). Track: ${env.CORS_ORIGIN}/profile/orders. Ceramic Studio`,
              )
              .catch((err) => log.error({ err }, "COD order confirmation SMS failed"));
          }
        }
      }).catch((err) => log.error({ err }, "User lookup for COD confirmation failed"));
    }

    return {
      orderId: Number(order.id),
      orderNumber: order.orderNumber,
      totalAmount: Number(order.totalAmount),
      status: order.status,
      paymentMethod: input.paymentMethod,
    };
  },

  /**
   * Get Order detail.
   */
  async getOrderDetail(userId: string, id: number) {
    const order = await db.select("orders", "*", "id = ? AND user_id = ? AND deleted_at IS NULL", [BigInt(id), userId]);
    if (!order) throw AppError.notFound("Order");

    // Fetch address detail
    const address = await db.select("addresses", "*", "id = ?", [BigInt(order.address_id)]);

    // Fetch items with joined product info
    const items = await db.queryAll(
      `SELECT oi.*, p.name as product_name, p.slug as product_slug, pi.url as product_image
       FROM ec_order_items oi
       JOIN ec_products p ON oi.product_id = p.id
       LEFT JOIN ec_product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
       WHERE oi.order_id = ?`,
      [BigInt(id)]
    );

    // Fetch payments
    const payments = await db.selectAll("payments", "*", "order_id = ?", [BigInt(id)]);

    // Fetch shipments
    const shipments = await db.selectAll("shipments", "*", "order_id = ?", [BigInt(id)]);

    return {
      id: Number(order.id),
      orderNumber: order.order_number,
      status: order.status,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discount_amount),
      shippingAmount: Number(order.shipping_amount),
      taxAmount: Number(order.tax_amount),
      totalAmount: Number(order.total_amount),
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      address: address ? {
        id: Number(address.id),
        userId: address.user_id,
        fullName: address.fullName,
        mobileNumber: address.mobile_number,
        email: address.email,
        pincode: address.pincode,
        addressLine1: address.address_line_1,
        addressLine2: address.address_line_2,
        city: address.city,
        state: address.state,
        country: address.country,
        landmark: address.landmark,
        addressType: address.address_type,
        isDefault: Boolean(address.is_default),
        createdAt: address.created_at,
        updatedAt: address.updated_at
      } : null,
      items: items.map((item) => ({
        id: Number(item.id),
        productId: Number(item.product_id),
        variantId: item.variant_id ? Number(item.variant_id) : null,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
        lineTotal: Number(item.line_total),
        name: item.product_name ?? "Unknown",
        slug: item.product_slug ?? "",
        image: item.product_image ?? null,
      })),
      payments: payments.map((p) => ({
        id: Number(p.id),
        provider: p.provider,
        status: p.status,
        amount: Number(p.amount),
        createdAt: p.created_at,
      })),
      shipments: shipments.map((s) => ({
        id: Number(s.id),
        provider: s.provider,
        awbCode: s.awb_code,
        status: s.status,
        trackingUrl: s.tracking_url,
      })),
    };
  },

  /**
   * Get order detail (admin — no user ownership check).
   */
  async getAdminOrderDetail(id: number) {
    const order = await db.select("orders", "*", "id = ? AND deleted_at IS NULL", [BigInt(id)]);
    if (!order) throw AppError.notFound("Order");

    const user = await db.select("users", "id, email, fullName, phone", "id = ?", [order.user_id]);
    const detail = await this.getOrderDetail(order.user_id, id);

    return {
      ...detail,
      userId: order.user_id,
      customerName: user?.fullName ?? null,
      customerEmail: user?.email ?? null,
      customerPhone: user?.phone ?? null,
    };
  },
  async listUserOrders(userId: string, query: { page?: number; limit?: number }) {
    const { page, limit, skip } = parsePagination(query as Record<string, unknown>);

    const ordersData = await db.queryAll(
      `SELECT o.id, o.order_number, o.status, o.total_amount, o.created_at
       FROM ec_orders o
       WHERE o.user_id = ? AND o.deleted_at IS NULL
       ORDER BY o.created_at DESC
       LIMIT ${Number(limit)} OFFSET ${Number(skip)}`,
      [userId]
    );

    const total = await db.count("orders", "user_id = ? AND deleted_at IS NULL", [userId]);

    const orderIds = ordersData.map((o) => BigInt(o.id));
    const previewItemsMap = new Map<number, { name: string; url: string | null }>();

    if (orderIds.length > 0) {
      // Find the first order_item for each order using a single SQL join query to avoid N+1 queries
      const previewRows = await db.queryAll(
        `SELECT oi.order_id as orderId, p.name, pi.url
         FROM ec_order_items oi
         JOIN ec_products p ON oi.product_id = p.id
         LEFT JOIN ec_product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
         JOIN (
           SELECT order_id, MIN(id) as min_id
           FROM ec_order_items
           WHERE order_id IN (${orderIds.map(() => "?").join(",")})
           GROUP BY order_id
         ) sub ON oi.id = sub.min_id`,
        orderIds
      );
      for (const row of previewRows) {
        previewItemsMap.set(Number(row.orderId), {
          name: row.name,
          url: row.url,
        });
      }
    }

    const orders = ordersData.map((o) => {
      const preview = previewItemsMap.get(Number(o.id));
      return {
        id: Number(o.id),
        orderNumber: o.order_number,
        status: o.status,
        totalAmount: Number(o.total_amount),
        createdAt: o.created_at,
        previewItemName: preview?.name ?? "Products",
        previewItemImage: preview?.url ?? null,
      };
    });

    return { data: orders, total, page, limit };
  },

  /**
   * Admin: List all system orders with filter/pagination.
   */
  async listAll(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;

    let whereSQL = "o.deleted_at IS NULL";
    const params: any[] = [];
    if (status) {
      whereSQL += " AND o.status = ?";
      params.push(status);
    }

    const total = await db.count("orders", whereSQL.replace(/o\./g, ""), params);

    const queryParams = [...params, limit, skip];
    const data = await db.queryAll(
      `SELECT o.*, u.fullName as customer_name, u.email as customer_email
       FROM ec_orders o
       JOIN ec_users u ON o.user_id = u.id
       WHERE ${whereSQL}
       ORDER BY o.created_at DESC
       LIMIT ${Number(limit)} OFFSET ${Number(skip)}`,
      params
    );

    const orders = data.map((o) => ({
      id: Number(o.id),
      orderNumber: o.order_number,
      userId: o.user_id,
      addressId: Number(o.address_id),
      status: o.status,
      subtotal: Number(o.subtotal),
      discountAmount: Number(o.discount_amount),
      shippingAmount: Number(o.shipping_amount),
      taxAmount: Number(o.tax_amount),
      totalAmount: Number(o.total_amount),
      couponId: o.coupon_id ? Number(o.coupon_id) : null,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      deletedAt: o.deleted_at,
      customerName: o.customer_name,
      customerEmail: o.customer_email,
    }));

    return { data: orders, total, page, limit };
  },

  /**
   * Admin: Update order status (PENDING, PAID, PROCESSING, PACKED, SHIPPED, DELIVERED, CANCELLED, REFUNDED).
   */
  async updateStatus(id: number, status: OrderStatusType) {
    const order = await db.select("orders", "*", "id = ? AND deleted_at IS NULL", [BigInt(id)]);
    if (!order) throw AppError.notFound("Order");

    const currentStatus = order.status as OrderStatusType;
    const allowed = ORDER_STATUS_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(status)) {
      throw AppError.badRequest(`Cannot transition order from ${currentStatus} to ${status}`);
    }

    await db.update("orders", { status }, "id = ?", [BigInt(id)]);

    const updated = await db.select("orders", "*", "id = ?", [BigInt(id)]);
    log.info({ orderId: id, from: currentStatus, to: status }, "Order status updated");
    return updated;
  },
};

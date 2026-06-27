import { db } from "../../database/mysql.js";
import { AppError } from "../../common/api-error.js";
import { DISCOUNT_TIERS, COD_SURCHARGE } from "../../config/constants.js";
import { createModuleLogger } from "../../utils/logger.js";
import { generateUUID } from "../../utils/crypto.js";

const log = createModuleLogger("cart-service");

export const cartService = {
  /**
   * Helper to retrieve or create a cart for user/guest.
   */
  async getOrCreateCart(userId: string | null, guestToken: string | null) {
    if (userId) {
      let cart: any = await db.select("carts", "id, user_id, guest_token", "user_id = ?", [userId]);
      if (!cart) {
        const result = await db.insert("carts", { user_id: userId, guest_token: null });
        cart = { id: result.insertId, user_id: userId, guest_token: null };
      }
      return {
        id: BigInt(cart.id),
        userId: cart.user_id,
        guestToken: cart.guest_token,
      };
    } else if (guestToken) {
      let cart: any = await db.select("carts", "id, user_id, guest_token", "guest_token = ?", [guestToken]);
      if (!cart) {
        const insertResult = await db.insert("carts", { user_id: null, guest_token: guestToken });
        cart = { id: insertResult.insertId, user_id: null, guest_token: guestToken };
      }
      return {
        id: BigInt(cart.id),
        userId: cart.user_id,
        guestToken: cart.guest_token,
      };
    } else {
      const newToken = generateUUID();
      const result = await db.insert("carts", { user_id: null, guest_token: newToken });
      return {
        id: BigInt(result.insertId),
        userId: null,
        guestToken: newToken,
      };
    }
  },

  /**
   * Get cart summary with calculations.
   */
  async getCartSummary(userId: string | null, guestToken: string | null) {
    const cart = await this.getOrCreateCart(userId, guestToken);

    // Retrieve and populate cart items with a single optimized SQL join query
    const rows = await db.queryAll(`
      SELECT ci.id, ci.product_id as productId, ci.variant_id as variantId, ci.quantity, ci.unit_price as unitPrice,
             p.name as productName, p.slug as productSlug, p.in_stock as productInStock, p.stock_count as productStockCount,
             pi.url as imageUrl,
             v.color as variantColor, v.size as variantSize, v.pack_size as variantPackSize, v.stock_count as variantStockCount
      FROM ec_cart_items ci
      LEFT JOIN ec_products p ON ci.product_id = p.id AND p.deleted_at IS NULL
      LEFT JOIN ec_product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      LEFT JOIN ec_product_variants v ON ci.variant_id = v.id
      WHERE ci.cart_id = ?
    `, [cart.id]);

    const populatedItems = rows.map((r) => {
      let variantInfo = null;
      if (r.variantId) {
        variantInfo = {
          color: r.variantColor,
          size: r.variantSize,
          packSize: r.variantPackSize,
          stockCount: Number(r.variantStockCount ?? 0),
        };
      }

      return {
        id: Number(r.id),
        productId: Number(r.productId),
        variantId: r.variantId ? Number(r.variantId) : null,
        quantity: Number(r.quantity),
        unitPrice: Number(r.unitPrice),
        name: r.productName ?? "Unknown Product",
        slug: r.productSlug ?? "",
        inStock: Boolean(r.productInStock),
        stockCount: Number(r.productStockCount ?? 0),
        image: r.imageUrl ?? null,
        variant: variantInfo,
      };
    });

    // Calculations
    const subtotal = populatedItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    // Apply discount tiers
    let shippingFee = 99;
    let discountPercent = 0;
    let tierName = "Standard Shipping";

    // Find applicable discount tier
    for (const tier of DISCOUNT_TIERS) {
      if (subtotal >= tier.threshold) {
        shippingFee = tier.shipping;
        discountPercent = tier.discountPct;
        tierName = tier.label;
      }
    }

    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const total = subtotal + shippingFee - discountAmount;

    return {
      cartId: Number(cart.id),
      guestToken: cart.guestToken,
      items: populatedItems,
      subtotal,
      shippingFee,
      discountPercent,
      discountAmount,
      tierName,
      total,
    };
  },

  /**
   * Add item to cart.
   */
  async addItem(
    userId: string | null,
    input: {
      productId: number;
      variantId?: number | null;
      quantity: number;
      guestToken?: string | null;
    },
  ) {
    const product = await db.select("products", "id, name, price, sale_price, in_stock, stock_count", "id = ? AND deleted_at IS NULL", [input.productId]);
    if (!product) throw AppError.notFound("Product");

    // Stock check
    if (!product.in_stock || product.stock_count < input.quantity) {
      throw AppError.insufficientStock(product.name);
    }

    let unitPrice = Number(product.sale_price ?? product.price);

    if (input.variantId) {
      const variant = await db.select("product_variants", "id, product_id, price_delta, stock_count", "id = ?", [input.variantId]);
      if (!variant || Number(variant.product_id) !== input.productId) {
        throw AppError.notFound("Product variant");
      }
      if (variant.stock_count < input.quantity) {
        throw AppError.insufficientStock(`${product.name} (Variant)`);
      }
      // Add price delta if any
      unitPrice += Number(variant.price_delta);
    }

    const cart = await this.getOrCreateCart(userId, input.guestToken ?? null);

    // Check if item already exists in this cart
    const queryVarId = input.variantId ? BigInt(input.variantId) : null;
    const existing = await db.select(
      "cart_items",
      "id, quantity",
      "cart_id = ? AND product_id = ? AND variant_id " + (queryVarId === null ? "IS NULL" : "= ?"),
      queryVarId === null ? [cart.id, input.productId] : [cart.id, input.productId, queryVarId]
    );

    if (existing) {
      await db.update(
        "cart_items",
        {
          quantity: Number(existing.quantity) + input.quantity,
          unit_price: unitPrice,
        },
        "id = ?",
        [existing.id]
      );
    } else {
      await db.insert("cart_items", {
        cart_id: cart.id,
        product_id: BigInt(input.productId),
        variant_id: queryVarId,
        quantity: input.quantity,
        unit_price: unitPrice,
      });
    }

    log.info({ cartId: Number(cart.id), productId: input.productId }, "Item added to cart");
    return this.getCartSummary(userId, cart.guestToken);
  },

  /**
   * Update cart item quantity.
   */
  async updateItem(
    userId: string | null,
    itemId: number,
    quantity: number,
    guestToken: string | null,
  ) {
    const cart = await this.getOrCreateCart(userId, guestToken);

    const item = await db.select("cart_items", "id, product_id, variant_id, quantity", "id = ? AND cart_id = ?", [itemId, cart.id]);
    if (!item) throw AppError.notFound("Cart item");

    // Stock Check
    const product = await db.select("products", "id, name, stock_count", "id = ? AND deleted_at IS NULL", [item.product_id]);
    if (!product) throw AppError.notFound("Product");

    if (item.variant_id) {
      const variant = await db.select("product_variants", "id, stock_count", "id = ?", [item.variant_id]);
      if (!variant || variant.stock_count < quantity) {
        throw AppError.insufficientStock(`${product.name} (Variant)`);
      }
    } else {
      if (product.stock_count < quantity) {
        throw AppError.insufficientStock(product.name);
      }
    }

    await db.update(
      "cart_items",
      { quantity },
      "id = ?",
      [itemId]
    );

    log.info({ itemId }, "Cart item updated");
    return this.getCartSummary(userId, cart.guestToken);
  },

  /**
   * Remove item from cart.
   */
  async removeItem(userId: string | null, itemId: number, guestToken: string | null) {
    const cart = await this.getOrCreateCart(userId, guestToken);

    const item = await db.select("cart_items", "id", "id = ? AND cart_id = ?", [itemId, cart.id]);
    if (!item) throw AppError.notFound("Cart item");

    await db.delete("cart_items", "id = ?", [itemId]);

    log.info({ itemId }, "Cart item removed");
    return this.getCartSummary(userId, cart.guestToken);
  },

  /**
   * Merge guest cart into user cart upon login/register.
   */
  async mergeCart(userId: string, guestToken: string) {
    const guestCart = await db.select("carts", "id", "guest_token = ?", [guestToken]);
    if (!guestCart) return;

    const guestItems = await db.selectAll("cart_items", "*", "cart_id = ?", [guestCart.id]);
    if (guestItems.length === 0) return;

    const userCart = await this.getOrCreateCart(userId, null);

    for (const gItem of guestItems) {
      const existing = await db.select(
        "cart_items",
        "id, quantity",
        "cart_id = ? AND product_id = ? AND variant_id " + (gItem.variant_id === null ? "IS NULL" : "= ?"),
        gItem.variant_id === null ? [userCart.id, gItem.product_id] : [userCart.id, gItem.product_id, gItem.variant_id]
      );

      if (existing) {
        await db.update(
          "cart_items",
          {
            quantity: Number(existing.quantity) + Number(gItem.quantity),
          },
          "id = ?",
          [existing.id]
        );
      } else {
        await db.insert("cart_items", {
          cart_id: userCart.id,
          product_id: gItem.product_id,
          variant_id: gItem.variant_id,
          quantity: gItem.quantity,
          unit_price: gItem.unit_price,
        });
      }
    }

    // Delete guest cart and items
    await db.delete("cart_items", "cart_id = ?", [guestCart.id]);
    await db.delete("carts", "id = ?", [guestCart.id]);

    log.info({ userId, guestToken }, "Guest cart merged into user cart");
  },
};

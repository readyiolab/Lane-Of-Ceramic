import { Router } from "express";
import { authRouter } from "../modules/auth/auth.route.js";
import { productsRouter } from "../modules/products/products.route.js";
import { categoriesRouter } from "../modules/categories/categories.route.js";
import { brandsRouter } from "../modules/brands/brands.route.js";
import { cartRouter } from "../modules/cart/cart.route.js";
import { addressesRouter } from "../modules/addresses/addresses.route.js";
import { ordersRouter } from "../modules/orders/orders.route.js";
import { paymentsRouter } from "../modules/payments/payments.route.js";
import { shipmentsRouter } from "../modules/shipments/shipments.route.js";
import { wishlistRouter } from "../modules/wishlist/wishlist.route.js";
import { reviewsRouter } from "../modules/reviews/reviews.route.js";
import { couponsRouter } from "../modules/coupons/coupons.route.js";
import { adminRouter } from "../modules/admin/admin.route.js";
import { usersRouter } from "../modules/users/users.route.js";
import { uploadRouter } from "../modules/upload/upload.route.js";
import { inventoryRouter } from "../modules/inventory/inventory.route.js";
import { bundlesRouter } from "../modules/bundles/bundles.route.js";
import { discountTiersRouter } from "../modules/discount-tiers/discount-tiers.route.js";
import { announcementsRouter } from "../modules/announcements/announcements.route.js";
import { siteContentRouter } from "../modules/site-content/site-content.route.js";
import { auditRouter } from "../modules/audit/audit.route.js";

export const router = Router();

// Health Check
router.get("/health", (_req, res) => res.json({ success: true, service: "ok" }));

// Route Mappings
router.use("/auth", authRouter);
router.use("/products", productsRouter);
router.use("/categories", categoriesRouter);
router.use("/brands", brandsRouter);
router.use("/cart", cartRouter);
router.use("/addresses", addressesRouter);
router.use("/orders", ordersRouter);
router.use("/payments", paymentsRouter);
router.use("/shipments", shipmentsRouter);
router.use("/wishlist", wishlistRouter);
router.use("/reviews", reviewsRouter);
router.use("/coupons", couponsRouter);
router.use("/users", usersRouter);
router.use("/upload", uploadRouter);
router.use("/inventory", inventoryRouter);
router.use("/bundles", bundlesRouter);
router.use("/discount-tiers", discountTiersRouter);
router.use("/announcements", announcementsRouter);
router.use("/site-content", siteContentRouter);
router.use("/audit", auditRouter);
router.use("/admin", adminRouter);

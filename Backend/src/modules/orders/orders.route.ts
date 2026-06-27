import { Router } from "express";
import { orderController } from "./orders.controller.js";
import { validateBody, validateQuery, validateParams } from "../../middlewares/validate.middleware.js";
import { authGuard, requireAdmin } from "../../middlewares/auth.middleware.js";
import {
  placeOrderSchema,
  orderIdParamSchema,
  orderListQuerySchema,
  updateOrderStatusSchema,
} from "./orders.validator.js";

export const ordersRouter = Router();

ordersRouter.use(authGuard);

ordersRouter.post("/", validateBody(placeOrderSchema), orderController.place);
ordersRouter.get("/", validateQuery(orderListQuerySchema), orderController.list);

// Admin routes before /:id to avoid route conflicts
ordersRouter.get("/admin/list", requireAdmin, validateQuery(orderListQuerySchema), orderController.adminList);
ordersRouter.get("/admin/:id", requireAdmin, validateParams(orderIdParamSchema), orderController.adminGetById);
ordersRouter.patch(
  "/admin/:id/status",
  requireAdmin,
  validateParams(orderIdParamSchema),
  validateBody(updateOrderStatusSchema),
  orderController.adminUpdateStatus,
);

ordersRouter.get("/:id", validateParams(orderIdParamSchema), orderController.getById);

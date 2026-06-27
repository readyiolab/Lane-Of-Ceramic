import { Router } from "express";
import { inventoryController } from "./inventory.controller.js";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate.middleware.js";
import { authGuard, requireAdmin } from "../../middlewares/auth.middleware.js";
import {
  adjustStockSchema,
  productIdParamSchema,
  inventoryLogsQuerySchema,
} from "./inventory.validator.js";

export const inventoryRouter = Router();

inventoryRouter.use(authGuard, requireAdmin);
inventoryRouter.get("/logs", validateQuery(inventoryLogsQuerySchema), inventoryController.listLogs);
inventoryRouter.patch(
  "/products/:productId/stock",
  validateParams(productIdParamSchema),
  validateBody(adjustStockSchema),
  inventoryController.adjustStock,
);

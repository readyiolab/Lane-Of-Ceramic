import { Router } from "express";
import { discountTierController } from "./discount-tiers.controller.js";
import { validateBody, validateParams } from "../../middlewares/validate.middleware.js";
import { authGuard, requireAdmin } from "../../middlewares/auth.middleware.js";
import {
  createDiscountTierSchema,
  updateDiscountTierSchema,
  tierIdParamSchema,
} from "./discount-tiers.validator.js";

export const discountTiersRouter = Router();

discountTiersRouter.get("/", discountTierController.listActive);

discountTiersRouter.use(authGuard, requireAdmin);
discountTiersRouter.get("/admin", discountTierController.list);
discountTiersRouter.get("/admin/:id", validateParams(tierIdParamSchema), discountTierController.getById);
discountTiersRouter.post("/admin", validateBody(createDiscountTierSchema), discountTierController.create);
discountTiersRouter.patch(
  "/admin/:id",
  validateParams(tierIdParamSchema),
  validateBody(updateDiscountTierSchema),
  discountTierController.update,
);
discountTiersRouter.delete("/admin/:id", validateParams(tierIdParamSchema), discountTierController.remove);

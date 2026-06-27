import { Router } from "express";
import { bundleController } from "./bundles.controller.js";
import { validateBody, validateParams } from "../../middlewares/validate.middleware.js";
import { authGuard, requireAdmin } from "../../middlewares/auth.middleware.js";
import { createBundleSchema, updateBundleSchema, bundleIdParamSchema } from "./bundles.validator.js";

export const bundlesRouter = Router();

bundlesRouter.get("/active", bundleController.listActive);

bundlesRouter.use(authGuard, requireAdmin);
bundlesRouter.get("/", bundleController.list);
bundlesRouter.get("/:id", validateParams(bundleIdParamSchema), bundleController.getById);
bundlesRouter.post("/", validateBody(createBundleSchema), bundleController.create);
bundlesRouter.patch(
  "/:id",
  validateParams(bundleIdParamSchema),
  validateBody(updateBundleSchema),
  bundleController.update,
);
bundlesRouter.delete("/:id", validateParams(bundleIdParamSchema), bundleController.remove);

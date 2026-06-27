import { Router } from "express";
import { siteContentController } from "./site-content.controller.js";
import { validateBody, validateParams } from "../../middlewares/validate.middleware.js";
import { authGuard, requireAdmin } from "../../middlewares/auth.middleware.js";
import { upsertSiteContentSchema, contentKeyParamSchema } from "./site-content.validator.js";

export const siteContentRouter = Router();

siteContentRouter.get("/:key", validateParams(contentKeyParamSchema), siteContentController.getByKey);

siteContentRouter.use(authGuard, requireAdmin);
siteContentRouter.get("/", siteContentController.list);
siteContentRouter.put("/", validateBody(upsertSiteContentSchema), siteContentController.upsert);
siteContentRouter.delete("/:key", validateParams(contentKeyParamSchema), siteContentController.remove);

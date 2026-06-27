import { Router } from "express";
import { auditController } from "./audit.controller.js";
import { authGuard, requireAdmin } from "../../middlewares/auth.middleware.js";

export const auditRouter = Router();

auditRouter.use(authGuard, requireAdmin);
auditRouter.get("/", auditController.list);

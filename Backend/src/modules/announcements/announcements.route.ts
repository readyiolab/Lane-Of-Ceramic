import { Router } from "express";
import { announcementController } from "./announcements.controller.js";
import { validateBody, validateParams } from "../../middlewares/validate.middleware.js";
import { authGuard, requireAdmin } from "../../middlewares/auth.middleware.js";
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  announcementIdParamSchema,
} from "./announcements.validator.js";

export const announcementsRouter = Router();

announcementsRouter.get("/active", announcementController.listActive);

announcementsRouter.use(authGuard, requireAdmin);
announcementsRouter.get("/", announcementController.list);
announcementsRouter.get("/:id", validateParams(announcementIdParamSchema), announcementController.getById);
announcementsRouter.post("/", validateBody(createAnnouncementSchema), announcementController.create);
announcementsRouter.patch(
  "/:id",
  validateParams(announcementIdParamSchema),
  validateBody(updateAnnouncementSchema),
  announcementController.update,
);
announcementsRouter.delete("/:id", validateParams(announcementIdParamSchema), announcementController.remove);

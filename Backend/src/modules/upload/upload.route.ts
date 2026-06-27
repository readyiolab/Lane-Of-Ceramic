import { Router } from "express";
import multer from "multer";
import { uploadController } from "./upload.controller.js";
import { authGuard, requireAdmin } from "../../middlewares/auth.middleware.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPEG, PNG, WebP, GIF images are allowed"));
  },
});

export const uploadRouter = Router();

uploadRouter.post("/", authGuard, requireAdmin, upload.single("file"), uploadController.uploadImage);

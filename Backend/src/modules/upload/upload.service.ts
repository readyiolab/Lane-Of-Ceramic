import crypto from "crypto";
import axios from "axios";
import { env } from "../../config/env.js";
import { AppError } from "../../common/api-error.js";
import { createModuleLogger } from "../../utils/logger.js";

const log = createModuleLogger("upload");

export const uploadService = {
  async uploadToCloudinary(file: any, folder = "products") {
    if (
      env.CLOUDINARY_CLOUD_NAME === "change_me" ||
      env.CLOUDINARY_API_KEY === "change_me"
    ) {
      const base64 = file.buffer.toString("base64");
      const dataUrl = `data:${file.mimetype};base64,${base64}`;
      log.warn("Cloudinary not configured — returning data URL (dev only)");
      return { url: dataUrl, publicId: null, folder };
    }

    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = `folder=ceramic-studio/${folder}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign + env.CLOUDINARY_API_SECRET)
      .digest("hex");

    const base64File = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          file: base64File,
          api_key: env.CLOUDINARY_API_KEY,
          timestamp,
          signature,
          folder: `ceramic-studio/${folder}`,
        },
      );
      return {
        url: res.data.secure_url as string,
        publicId: res.data.public_id as string,
        folder,
      };
    } catch (err: any) {
      log.error({ err: err.response?.data || err.message }, "Cloudinary upload failed");
      throw AppError.internal("Image upload failed");
    }
  },
};

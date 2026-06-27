import { z } from "zod";
import { USER_ROLES } from "../../config/constants.js";

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(150).optional(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number")
    .optional(),
});

export const adminUpdateUserSchema = z.object({
  fullName: z.string().min(2).max(150).optional(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number")
    .optional(),
  role: z.enum([USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.VENDOR]).optional(),
  isActive: z.boolean().optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid("Invalid user ID"),
});

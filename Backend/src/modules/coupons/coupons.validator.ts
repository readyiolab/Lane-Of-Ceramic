import { z } from "zod";

export const createCouponSchema = z.object({
  code: z.string().min(3).max(50).toUpperCase(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive(),
  minOrderValue: z.number().nonnegative().optional().nullable(),
  maxDiscount: z.number().nonnegative().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  isFirstOrderOnly: z.boolean().default(false),
  startsAt: z.coerce.date().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateCouponSchema = createCouponSchema.partial();

export const couponIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const checkCouponQuerySchema = z.object({
  code: z.string().min(1),
  subtotal: z.coerce.number().positive(),
});

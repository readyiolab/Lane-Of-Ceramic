import { z } from "zod";

export const createDiscountTierSchema = z.object({
  threshold: z.coerce.number().min(0),
  label: z.string().min(2).max(120),
  icon: z.string().max(20).optional().nullable(),
  discountPct: z.coerce.number().min(0).max(100).default(0),
  shipping: z.coerce.number().min(0).default(0),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateDiscountTierSchema = createDiscountTierSchema.partial();

export const tierIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

import { z } from "zod";

export const createBundleSchema = z.object({
  slug: z.string().min(2).max(80),
  label: z.string().min(2).max(120),
  tagline: z.string().max(255).optional().nullable(),
  itemCount: z.coerce.number().int().positive(),
  price: z.coerce.number().positive(),
  isActive: z.boolean().default(true),
});

export const updateBundleSchema = createBundleSchema.partial();

export const bundleIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

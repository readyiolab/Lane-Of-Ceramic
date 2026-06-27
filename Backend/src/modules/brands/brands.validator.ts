import { z } from "zod";

export const createBrandSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  description: z.string().max(500).optional().nullable(),
  logo: z.string().url("Invalid logo URL").optional().nullable(),
});

export const updateBrandSchema = createBrandSchema.partial();

export const brandIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

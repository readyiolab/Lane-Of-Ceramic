import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  parentId: z.coerce.number().int().positive().optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  image: z.string().url("Invalid image URL").optional().nullable(),
  subtitle: z.string().max(255).optional().nullable(),
  heroImage: z.string().url().optional().nullable(),
  heroTitle: z.string().max(255).optional().nullable(),
  displayOrder: z.coerce.number().int().default(0).optional(),
  sortOrder: z.coerce.number().int().default(0).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const categorySlugParamSchema = z.object({
  slug: z.string().min(1),
});

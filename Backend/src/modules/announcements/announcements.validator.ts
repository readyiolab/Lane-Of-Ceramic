import { z } from "zod";

export const createAnnouncementSchema = z.object({
  text: z.string().min(2).max(500),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
  startsAt: z.coerce.date().optional().nullable(),
  endsAt: z.coerce.date().optional().nullable(),
});

export const updateAnnouncementSchema = createAnnouncementSchema.partial();

export const announcementIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

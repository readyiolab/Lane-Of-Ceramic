import { z } from "zod";

export const upsertSiteContentSchema = z.object({
  key: z.string().min(2).max(120),
  value: z.record(z.unknown()),
});

export const contentKeyParamSchema = z.object({
  key: z.string().min(1).max(120),
});

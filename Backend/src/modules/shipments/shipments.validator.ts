import { z } from "zod";

export const bookShipmentSchema = z.object({
  orderId: z.coerce.number().int().positive(),
});

export const bookAwbSchema = z.object({
  shipmentId: z.coerce.number().int().positive(),
  courierId: z.coerce.number().int().positive().optional(),
});

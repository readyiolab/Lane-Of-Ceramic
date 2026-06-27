import { z } from "zod";

export const initiatePaymentSchema = z.object({
  orderId: z.coerce.number().int().positive(),
});

export const verifyPaymentSchema = z.object({
  orderId: z.coerce.number().int().positive(),
  providerOrderId: z.string().min(1),
  cfPaymentId: z.string().optional(),
});

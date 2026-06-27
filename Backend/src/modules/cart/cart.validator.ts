import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.coerce.number().int().positive(),
  variantId: z.coerce.number().int().positive().optional().nullable(),
  quantity: z.coerce.number().int().min(1).default(1),
  guestToken: z.string().max(120).optional().nullable(),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1),
  guestToken: z.string().max(120).optional().nullable(),
});

export const getCartQuerySchema = z.object({
  guestToken: z.string().max(120).optional().nullable(),
});

export const cartItemIdParamSchema = z.object({
  itemId: z.coerce.number().int().positive(),
});

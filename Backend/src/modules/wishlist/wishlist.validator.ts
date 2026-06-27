import { z } from "zod";

export const toggleWishlistSchema = z.object({
  productId: z.coerce.number().int().positive(),
});

import { apiFetch } from "./client";

export interface AddToCartPayload {
  productId: number;
  variantId?: number;
  quantity: number;
  guestToken?: string;
}

export async function addToCart(payload: AddToCartPayload) {
  return apiFetch<any>("/cart", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

import { apiFetch } from "./client";

export interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  id: number;
  orderId?: string;
  orderNumber?: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  previewItemName?: string;
  previewItemImage?: string | null;
}

export async function fetchMyOrders() {
  return apiFetch<Order[]>("/orders");
}

export async function createOrder(payload: any) {
  return apiFetch<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

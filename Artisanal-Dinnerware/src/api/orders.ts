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
  orderId: string;
  status: string;
  total: number;
  createdAt: string;
  items?: OrderItem[];
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

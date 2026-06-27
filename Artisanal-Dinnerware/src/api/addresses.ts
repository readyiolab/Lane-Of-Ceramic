import { apiFetch } from "./client";

export interface AddressPayload {
  fullName: string;
  mobileNumber: string;
  email?: string;
  pincode: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country?: string;
  addressType?: "HOME" | "WORK" | "OTHER";
}

export interface AddressResponse {
  id: number;
  user_id: string;
  fullName: string;
  mobileNumber: string;
  email: string | null;
  pincode: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  country: string;
  landmark: string | null;
  addressType: "HOME" | "WORK" | "OTHER";
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function createAddress(payload: AddressPayload) {
  return apiFetch<AddressResponse>("/addresses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

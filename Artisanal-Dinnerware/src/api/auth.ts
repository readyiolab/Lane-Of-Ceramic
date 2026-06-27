import { apiFetch } from "./client";

export async function login(email: string, password: string) {
  return apiFetch<any>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(fullName: string, email: string, password: string, phone: string) {
  return apiFetch<any>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ fullName, email, password, phone }),
  });
}

export async function logout() {
  return apiFetch<any>("/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`
    }
  });
}

export async function sendOtp(email: string) {
  return apiFetch<any>("/auth/send-email-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyOtp(email: string, otp: string) {
  return apiFetch<any>("/auth/verify-email-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}


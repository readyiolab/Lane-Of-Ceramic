import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

/** Generate UUID v4 */
export function generateUUID(): string {
  return uuidv4();
}

/** Generate a cryptographically secure random token (hex) */
export function generateToken(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString("hex");
}

/** Generate a numeric OTP of given length */
export function generateOTP(length = 6): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(crypto.randomInt(min, max));
}

/** Generate an order number: ORD-YYYYMMDD-XXXXX */
export function generateOrderNumber(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `ORD-${y}${m}${d}-${rand}`;
}

/** HMAC SHA256 signature verification (for Cashfree/Shiprocket webhooks) */
export function verifyHMAC(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const computed = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64");
  return crypto.timingSafeEqual(
    Buffer.from(computed),
    Buffer.from(signature),
  );
}

/** Generate idempotency key */
export function generateIdempotencyKey(): string {
  return `idk_${generateUUID().replace(/-/g, "")}`;
}

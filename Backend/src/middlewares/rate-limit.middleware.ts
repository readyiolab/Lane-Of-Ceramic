import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

/** General API rate limiter */
export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
    code: "RATE_LIMITED",
  },
});

/** Strict rate limiter for auth routes (5 requests per minute) */
export const authRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again after 1 minute",
    code: "AUTH_RATE_LIMITED",
  },
});

/** Payment route limiter (10 requests per minute) */
export const paymentRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many payment requests, please try again later",
    code: "PAYMENT_RATE_LIMITED",
  },
});

/** Admin write rate limiter */
export const adminWriteRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many admin write requests",
    code: "ADMIN_RATE_LIMITED",
  },
});

import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../common/api-error.js";
import { createModuleLogger } from "../utils/logger.js";
import { env } from "../config/env.js";

const log = createModuleLogger("error-handler");

/**
 * Global error handler middleware.
 * Handles AppError, ZodError, Prisma errors, and unknown errors.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // ── AppError (our custom errors) ─────────────────────────
  if (err instanceof AppError) {
    if (!err.isOperational) {
      log.error({ err, code: err.code }, "Non-operational error");
    }

    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      ...(err.details ? { errors: err.details } : {}),
    });
    return;
  }

  // ── Zod validation errors ────────────────────────────────
  if (err instanceof ZodError) {
    const formatted = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      errors: formatted,
    });
    return;
  }

  // ── Database (MySQL) errors ────────────────────────────────
  if (err && typeof err === "object" && "code" in err) {
    const dbErr = err as any;
    if (dbErr.code === "ER_DUP_ENTRY") {
      log.warn({ err: dbErr.message, code: dbErr.code }, "Database duplicate entry");
      const match = dbErr.message.match(/for key '.*?([^.]+)$/);
      const field = match ? match[1].replace(/_unique/i, "") : "field";
      res.status(409).json({
        success: false,
        message: `A record with this ${field} already exists`,
        code: "DUPLICATE_ENTRY",
      });
      return;
    }

    if (dbErr.code === "ER_NO_REFERENCED_ROW" || dbErr.code === "ER_NO_REFERENCED_ROW_2") {
      log.warn({ err: dbErr.message, code: dbErr.code }, "Database foreign key constraint failed");
      res.status(400).json({
        success: false,
        message: "Referenced record does not exist",
        code: "FOREIGN_KEY_ERROR",
      });
      return;
    }

    if (dbErr.code === "ER_ROW_IS_REFERENCED" || dbErr.code === "ER_ROW_IS_REFERENCED_2") {
      log.warn({ err: dbErr.message, code: dbErr.code }, "Database restrict constraint failed");
      res.status(400).json({
        success: false,
        message: "Cannot delete this record because it is referenced by other items",
        code: "FOREIGN_KEY_ERROR",
      });
      return;
    }
  }

  // ── JWT errors ───────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      message: "Invalid token",
      code: "INVALID_TOKEN",
    });
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      message: "Token expired",
      code: "TOKEN_EXPIRED",
    });
    return;
  }

  // ── Syntax errors (malformed JSON body) ──────────────────
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      success: false,
      message: "Malformed JSON in request body",
      code: "INVALID_JSON",
    });
    return;
  }

  // ── Unknown errors ───────────────────────────────────────
  log.error({ err }, "Unhandled error");

  res.status(500).json({
    success: false,
    message: env.NODE_ENV === "production" ? "Internal server error" : err.message,
    code: "INTERNAL_ERROR",
  });
}

// Database error helper functions can be added here if needed

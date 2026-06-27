import sanitizeHtml from "sanitize-html";
import { Request, Response, NextFunction } from "express";

const SANITIZE_OPTIONS: Record<string, any> = {
  allowedTags: [],          // Strip all HTML
  allowedAttributes: {},
  disallowedTagsMode: "recursiveEscape",
};

/**
 * Recursively sanitise all string values in an object.
 */
function sanitizeDeep(obj: unknown): unknown {
  if (typeof obj === "string") {
    return sanitizeHtml(obj, SANITIZE_OPTIONS).trim();
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeDeep);
  }
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = sanitizeDeep(value);
    }
    return result;
  }
  return obj;
}

/**
 * Middleware that sanitises req.body, req.query, and req.params
 * by stripping all HTML tags and trimming strings.
 */
export function sanitizeInput(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeDeep(req.body);
  }
  if (req.query && typeof req.query === "object") {
    (req as any).query = sanitizeDeep(req.query);
  }
  if (req.params && typeof req.params === "object") {
    req.params = sanitizeDeep(req.params) as any;
  }
  next();
}

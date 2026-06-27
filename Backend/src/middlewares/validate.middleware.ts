import { z, ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../common/api-error.js";

/**
 * Generic Zod validation middleware.
 * Validates body, query, and/or params against provided schemas.
 */
export function validate(schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        (req as any).query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as any;
      }
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const formatted = err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        next(AppError.validation(formatted));
        return;
      }
      next(err);
    }
  };
}

/** Shorthand: validate only body */
export function validateBody(schema: ZodSchema) {
  return validate({ body: schema });
}

/** Shorthand: validate only query */
export function validateQuery(schema: ZodSchema) {
  return validate({ query: schema });
}

/** Shorthand: validate only params */
export function validateParams(schema: ZodSchema) {
  return validate({ params: schema });
}

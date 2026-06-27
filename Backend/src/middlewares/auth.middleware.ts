import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../common/api-error.js";
import { UserRoleType } from "../config/constants.js";

/** Decoded JWT payload */
export interface JwtPayload {
  sub: string;
  role: UserRoleType;
  iat: number;
  exp: number;
}

/** Extended request with user info */
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: UserRoleType;
  };
}

/**
 * Mandatory authentication guard.
 * Extracts and verifies JWT from Authorization header or cookie.
 * Throws 401 if no valid token is present.
 */
export function authGuard(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) {
      throw AppError.unauthorized("Authentication required");
    }

    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    req.user = {
      userId: payload.sub,
      role: payload.role as UserRoleType,
    };

    next();
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
      return;
    }
    if ((err as Error).name === "TokenExpiredError") {
      next(AppError.unauthorized("Token expired, please refresh"));
      return;
    }
    next(AppError.unauthorized("Invalid authentication token"));
  }
}

/**
 * Optional authentication.
 * Attaches user info if a valid token is present, but does not block if absent.
 */
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (token) {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
      req.user = {
        userId: payload.sub,
        role: payload.role as UserRoleType,
      };
    }
  } catch {
    // Token invalid/expired — proceed without user context
  }
  next();
}

/**
 * Role-based access control.
 * Must be used AFTER authGuard.
 */
export function requireRole(...roles: UserRoleType[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(AppError.unauthorized("Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden("Insufficient permissions"));
    }

    next();
  };
}

/**
 * Shorthand: require ADMIN or SUPER_ADMIN role.
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  return requireRole("ADMIN", "SUPER_ADMIN")(req, res, next);
}

/**
 * Shorthand: require SUPER_ADMIN role only.
 */
export function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  return requireRole("SUPER_ADMIN")(req, res, next);
}

/** Extract Bearer token from header or cookie */
function extractToken(req: Request): string | null {
  // Check Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Fallback: check cookie
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  return null;
}

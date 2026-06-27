import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service.js";
import { ApiResponse } from "../../common/api-response.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { env } from "../../config/env.js";

/** Cookie options for refresh token */
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: "lax" as const,
  domain: env.COOKIE_DOMAIN,
  path: "/api/v1/auth",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);

      // Set refresh token as httpOnly cookie
      res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);

      ApiResponse.created(res, {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);

      res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);

      ApiResponse.success(res, {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (err) {
      next(err);
    }
  },

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const refreshToken =
        req.body.refreshToken || req.cookies?.refreshToken || "";

      if (req.user?.userId) {
        await authService.logout(req.user.userId, refreshToken);
      }

      res.clearCookie("refreshToken", { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });
      ApiResponse.message(res, "Logged out successfully");
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken =
        req.body.refreshToken || req.cookies?.refreshToken || "";

      const result = await authService.refreshTokens(refreshToken);

      res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);

      ApiResponse.success(res, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.forgotPassword(req.body);
      // Always return success to prevent email enumeration
      ApiResponse.message(res, "If the email exists, a reset link has been sent");
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.resetPassword(req.body);
      ApiResponse.message(res, "Password reset successful. Please login with your new password.");
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await authService.changePassword(req.user!.userId, req.body);
      ApiResponse.message(res, "Password changed successfully");
    } catch (err) {
      next(err);
    }
  },

  async sendOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.sendOTP(req.body.phone);
      ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  },

  async verifyOTP(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.verifyOTP(req.body.phone, req.body.otp);
      ApiResponse.message(res, "Phone number verified successfully");
    } catch (err) {
      next(err);
    }
  },

  async sendEmailOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.sendEmailOTP(req.body.email);
      ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  },

  async verifyEmailOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.verifyEmailOTP(req.body.email, req.body.otp);

      res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);

      ApiResponse.success(res, {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (err) {
      next(err);
    }
  },
};

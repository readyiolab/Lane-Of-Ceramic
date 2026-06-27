import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { db } from "../../database/mysql.js";
import { redis } from "../../database/redis.js";
import { AppError } from "../../common/api-error.js";
import { generateUUID, generateToken, generateOTP } from "../../utils/crypto.js";
import { createModuleLogger } from "../../utils/logger.js";
import { CACHE_TTL, CACHE_KEY } from "../../config/constants.js";
import type { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput, ChangePasswordInput } from "./auth.validator.js";
import { emailService } from "../../services/email.service.js";
import { smsService } from "../../services/sms.service.js";

const log = createModuleLogger("auth-service");

/** Sign JWT access token */
function signAccessToken(userId: string, role: string): string {
  return jwt.sign({ role }, env.JWT_ACCESS_SECRET, {
    subject: userId,
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
  });
}

/** Sign JWT refresh token */
function signRefreshToken(userId: string): string {
  return jwt.sign({}, env.JWT_REFRESH_SECRET, {
    subject: userId,
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    jwtid: generateUUID(),
  });
}

/** Hash password with bcrypt */
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/** Compare password with hash */
async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export const authService = {
  /**
   * Register a new user.
   */
  async register(input: RegisterInput) {
    const existing = await db.select("users", "id", "email = ?", [input.email]);

    if (existing) {
      throw AppError.conflict("An account with this email already exists");
    }

    // Check phone uniqueness if provided
    if (input.phone) {
      const phoneExists = await db.select("users", "id", "phone = ?", [input.phone]);
      if (phoneExists) {
        throw AppError.conflict("An account with this phone number already exists");
      }
    }

    const passwordHash = await hashPassword(input.password);
    const userId = generateUUID();

    await db.insert("users", {
      id: userId,
      email: input.email,
      phone: input.phone ?? null,
      fullName: input.fullName,
      passwordHash,
      role: "USER",
    });

    const user = {
      id: userId,
      email: input.email,
      fullName: input.fullName,
      phone: input.phone ?? null,
      role: "USER",
      createdAt: new Date(),
    };

    // Generate tokens
    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id);

    // Store refresh token in Redis
    await redis.set(
      `${CACHE_KEY.SESSION}${user.id}:${refreshToken.slice(-8)}`,
      JSON.stringify({ userId: user.id, createdAt: Date.now() }),
      "EX",
      CACHE_TTL.USER_SESSION,
    );

    log.info({ userId: user.id, email: user.email }, "User registered");

    // Send Welcome Email asynchronously
    emailService.sendWelcomeEmail(user.email, user.fullName).catch((err) => {
      log.error({ err, userId: user.id }, "Failed to send welcome email");
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  },

  /**
   * Login with email and password.
   */
  async login(input: LoginInput) {
    const user = await db.select("users", "*", "email = ?", [input.email]);

    if (!user || user.deleted_at) {
      throw AppError.unauthorized("Invalid email or password");
    }

    if (!user.isActive) {
      throw AppError.forbidden("Your account has been deactivated. Contact support.");
    }

    const isMatch = await comparePassword(input.password, user.passwordHash);
    if (!isMatch) {
      throw AppError.unauthorized("Invalid email or password");
    }

    // Generate tokens
    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id);

    // Store session
    await redis.set(
      `${CACHE_KEY.SESSION}${user.id}:${refreshToken.slice(-8)}`,
      JSON.stringify({
        userId: user.id,
        role: user.role,
        createdAt: Date.now(),
      }),
      "EX",
      CACHE_TTL.USER_SESSION,
    );

    log.info({ userId: user.id }, "User logged in");

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        isEmailVerified: Boolean(user.is_email_verified),
      },
      accessToken,
      refreshToken,
    };
  },

  /**
   * Logout — invalidate refresh token.
   */
  async logout(userId: string, refreshToken: string) {
    const key = `${CACHE_KEY.SESSION}${userId}:${refreshToken.slice(-8)}`;
    await redis.del(key);
    log.info({ userId }, "User logged out");
  },

  /**
   * Refresh tokens — rotate refresh token.
   */
  async refreshTokens(refreshToken: string) {
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch {
      throw AppError.unauthorized("Invalid or expired refresh token");
    }

    const userId = payload.sub as string;
    const sessionKey = `${CACHE_KEY.SESSION}${userId}:${refreshToken.slice(-8)}`;

    // Check if the refresh token exists in Redis (not revoked)
    const session = await redis.get(sessionKey);
    if (!session) {
      throw AppError.unauthorized("Refresh token has been revoked");
    }

    // Delete old session
    await redis.del(sessionKey);

    // Fetch user to get current role
    const user = await db.select("users", "id, role, isActive", "id = ?", [userId]);

    if (!user || !user.isActive) {
      throw AppError.unauthorized("Account not found or deactivated");
    }

    // Generate new token pair
    const newAccessToken = signAccessToken(user.id, user.role);
    const newRefreshToken = signRefreshToken(user.id);

    // Store new session
    await redis.set(
      `${CACHE_KEY.SESSION}${user.id}:${newRefreshToken.slice(-8)}`,
      JSON.stringify({ userId: user.id, role: user.role, createdAt: Date.now() }),
      "EX",
      CACHE_TTL.USER_SESSION,
    );

    log.info({ userId }, "Tokens refreshed");

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },

  /**
   * Forgot password — generate reset token and store in Redis.
   */
  async forgotPassword(input: ForgotPasswordInput) {
    const user = await db.select("users", "id, email, fullName", "email = ?", [input.email]);

    // Always return success (don't reveal if email exists)
    if (!user) {
      log.warn({ email: input.email }, "Password reset requested for non-existent email");
      return;
    }

    const resetToken = generateToken(32);

    // Store reset token in Redis with 10 min TTL
    await redis.set(
      `${CACHE_KEY.OTP}reset:${resetToken}`,
      JSON.stringify({ userId: user.id }),
      "EX",
      CACHE_TTL.OTP,
    );

    // Send Password Reset Email asynchronously
    emailService.sendPasswordResetEmail(user.email, resetToken).catch((err) => {
      log.error({ err, userId: user.id }, "Failed to send password reset email");
    });

    log.info({ userId: user.id }, "Password reset token generated");

    return { resetToken }; // In production, this would only be sent via email
  },

  /**
   * Reset password with token.
   */
  async resetPassword(input: ResetPasswordInput) {
    const key = `${CACHE_KEY.OTP}reset:${input.token}`;
    const stored = await redis.get(key);

    if (!stored) {
      throw AppError.badRequest("Invalid or expired reset token");
    }

    const { userId } = JSON.parse(stored);
    const passwordHash = await hashPassword(input.newPassword);

    await db.update("users", { passwordHash }, "id = ?", [userId]);

    // Invalidate the reset token
    await redis.del(key);

    // Invalidate all existing sessions (force re-login)
    const sessionKeys = await redis.keys(`${CACHE_KEY.SESSION}${userId}:*`);
    if (sessionKeys.length > 0) {
      await redis.del(...sessionKeys.map((k: string) => k.replace(/^cs:/, "")));
    }

    log.info({ userId }, "Password reset successful");
  },

  /**
   * Change password (authenticated user).
   */
  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await db.select("users", "passwordHash", "id = ?", [userId]);

    if (!user) {
      throw AppError.notFound("User");
    }

    const isMatch = await comparePassword(input.oldPassword, user.passwordHash);
    if (!isMatch) {
      throw AppError.badRequest("Current password is incorrect");
    }

    const passwordHash = await hashPassword(input.newPassword);

    await db.update("users", { passwordHash }, "id = ?", [userId]);

    log.info({ userId }, "Password changed");
  },

  /**
   * Send OTP for phone verification.
   */
  async sendOTP(phone: string) {
    const otp = generateOTP(6);

    // Store OTP in Redis
    await redis.set(`${CACHE_KEY.OTP}phone:${phone}`, otp, "EX", CACHE_TTL.OTP);

    // Send OTP SMS asynchronously
    smsService.sendOtpSMS(phone, otp).catch((err) => {
      log.error({ err, phone: phone.slice(-4) }, "Failed to send OTP SMS");
    });

    log.info({ phone: phone.slice(-4) }, "OTP sent");

    return { message: "OTP sent successfully" };
  },

  /**
   * Verify OTP.
   */
  async verifyOTP(phone: string, otp: string) {
    const key = `${CACHE_KEY.OTP}phone:${phone}`;
    const stored = await redis.get(key);

    if (!stored || stored !== otp) {
      throw AppError.badRequest("Invalid or expired OTP");
    }

    // Delete OTP after verification
    await redis.del(key);

    log.info({ phone: phone.slice(-4) }, "OTP verified");
    return true;
  },
};

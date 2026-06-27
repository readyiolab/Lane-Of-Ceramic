import { db } from "../../database/mysql.js";
import { AppError } from "../../common/api-error.js";
import { createModuleLogger } from "../../utils/logger.js";
import { cacheInvalidatePattern } from "../../database/redis.js";

const log = createModuleLogger("user-service");

function mapUser(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    fullName: row.fullName ?? row.full_name,
    phone: row.phone,
    role: row.role,
    isActive: Boolean(row.isActive ?? row.is_active),
    isEmailVerified: Boolean(row.is_email_verified ?? row.isEmailVerified),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const userService = {
  /**
   * Get user profile by ID.
   */
  async getProfile(userId: string) {
    const user = await db.select("users", "*", "id = ? AND deleted_at IS NULL", [userId]);
    if (!user) throw AppError.notFound("User");
    return mapUser(user);
  },

  /**
   * Update user profile.
   */
  async updateProfile(userId: string, input: { fullName?: string; phone?: string }) {
    // Check if phone already taken
    if (input.phone) {
      const existing = await db.select("users", "id", "phone = ? AND id != ? AND deleted_at IS NULL", [
        input.phone,
        userId,
      ]);
      if (existing) throw AppError.conflict("Phone number is already in use");
    }

    await db.update(
      "users",
      {
        ...(input.fullName && { fullName: input.fullName }),
        ...(input.phone && { phone: input.phone }),
      },
      "id = ?",
      [userId],
    );

    const user = await db.select("users", "id, email, fullName, phone, role, updated_at", "id = ?", [userId]);
    if (!user) throw AppError.notFound("User");

    log.info({ userId }, "User profile updated");
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      updatedAt: user.updated_at,
    };
  },

  /**
   * Admin: List users with pagination.
   */
  async listAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const rows = await db.selectAll(
      "users",
      "*",
      "deleted_at IS NULL",
      [],
      `ORDER BY created_at DESC LIMIT ${limit} OFFSET ${skip}`,
    );
    const total = await db.count("users", "deleted_at IS NULL");

    return {
      data: rows.map(mapUser),
      total,
      page,
      limit,
    };
  },

  /**
   * Admin: Update user details (e.g. role, active status).
   */
  async adminUpdate(
    userId: string,
    input: { fullName?: string; phone?: string; role?: string; isActive?: boolean },
  ) {
    const existing = await db.select("users", "id", "id = ? AND deleted_at IS NULL", [userId]);
    if (!existing) throw AppError.notFound("User");

    if (input.phone) {
      const phoneTaken = await db.select("users", "id", "phone = ? AND id != ? AND deleted_at IS NULL", [
        input.phone,
        userId,
      ]);
      if (phoneTaken) throw AppError.conflict("Phone number is already in use");
    }

    await db.update(
      "users",
      {
        ...(input.fullName && { fullName: input.fullName }),
        ...(input.phone && { phone: input.phone }),
        ...(input.role && { role: input.role }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
      "id = ?",
      [userId],
    );

    const updated = await db.select("users", "id, email, fullName, role, isActive", "id = ?", [userId]);
    if (!updated) throw AppError.notFound("User");

    // Invalidate sessions if deactivated or role changed
    await cacheInvalidatePattern(`session:${userId}:*`);

    log.info({ userId, role: input.role, isActive: input.isActive }, "Admin updated user");

    return {
      id: updated.id,
      email: updated.email,
      fullName: updated.fullName,
      role: updated.role,
      isActive: Boolean(updated.isActive),
    };
  },

  /**
   * Admin/User: Soft delete account.
   */
  async deleteAccount(userId: string) {
    const user = await db.select("users", "id", "id = ? AND deleted_at IS NULL", [userId]);
    if (!user) throw AppError.notFound("User");

    await db.update(
      "users",
      {
        deleted_at: new Date(),
        isActive: false,
      },
      "id = ?",
      [userId],
    );

    // Invalidate all session tokens
    await cacheInvalidatePattern(`session:${userId}:*`);

    log.info({ userId }, "User account soft-deleted");
  },
};

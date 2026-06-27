import { db } from "../../database/mysql.js";
import { AppError } from "../../common/api-error.js";
import { createModuleLogger } from "../../utils/logger.js";
type AddressType = "HOME" | "WORK" | "OTHER";

const log = createModuleLogger("address-service");

function mapAddress(row: any) {
  if (!row) return null;
  return {
    id: Number(row.id),
    userId: row.user_id,
    fullName: row.fullName,
    mobileNumber: row.mobile_number,
    email: row.email,
    pincode: row.pincode,
    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2,
    city: row.city,
    state: row.state,
    country: row.country,
    landmark: row.landmark,
    addressType: row.address_type as AddressType,
    isDefault: Boolean(row.is_default),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export const addressService = {
  /**
   * List all addresses for user.
   */
  async listForUser(userId: string) {
    const list = await db.selectAll("addresses", "*", "user_id = ? AND deleted_at IS NULL", [userId], "ORDER BY is_default DESC");
    return list.map(mapAddress);
  },

  /**
   * Get address by ID for user.
   */
  async getById(userId: string, id: number) {
    const address = await db.select("addresses", "*", "id = ? AND user_id = ? AND deleted_at IS NULL", [id, userId]);
    if (!address) throw AppError.notFound("Address");
    return mapAddress(address);
  },

  /**
   * Create address.
   */
  async create(
    userId: string,
    input: {
      fullName: string;
      mobileNumber: string;
      email?: string | null;
      pincode: string;
      addressLine1: string;
      addressLine2?: string | null;
      city: string;
      state: string;
      country?: string;
      landmark?: string | null;
      addressType?: AddressType;
      isDefault?: boolean;
    },
  ) {
    // If it's the user's first address, force it to be default
    const count = await db.count("addresses", "user_id = ? AND deleted_at IS NULL", [userId]);
    const isDefault = count === 0 ? true : !!input.isDefault;

    // Transaction to update other defaults if this is default
    const address = await db.transaction(async (conn) => {
      if (isDefault) {
        await db.update(
          "addresses",
          { is_default: false },
          "user_id = ? AND is_default = ?",
          [userId, true],
          false,
          conn,
        );
      }

      const result = await db.insert(
        "addresses",
        {
          user_id: userId,
          fullName: input.fullName,
          mobile_number: input.mobileNumber,
          email: input.email ?? null,
          pincode: input.pincode,
          address_line_1: input.addressLine1,
          address_line_2: input.addressLine2 ?? null,
          city: input.city,
          state: input.state,
          country: input.country ?? "India",
          landmark: input.landmark ?? null,
          address_type: input.addressType ?? "HOME",
          is_default: isDefault,
        },
        false,
        conn,
      );

      const row = await db.select("addresses", "*", "id = ?", [result.insertId], false, conn);
      return mapAddress(row);
    });

    log.info({ addressId: Number(address?.id), userId }, "Address created");
    return address;
  },

  /**
   * Update address.
   */
  async update(
    userId: string,
    id: number,
    input: {
      fullName?: string;
      mobileNumber?: string;
      email?: string | null;
      pincode?: string;
      addressLine1?: string;
      addressLine2?: string | null;
      city?: string;
      state?: string;
      country?: string;
      landmark?: string | null;
      addressType?: AddressType;
      isDefault?: boolean;
    },
  ) {
    const existing = await db.select("addresses", "*", "id = ? AND user_id = ? AND deleted_at IS NULL", [id, userId]);
    if (!existing) throw AppError.notFound("Address");

    const isDefault = input.isDefault !== undefined ? input.isDefault : Boolean(existing.is_default);

    const address = await db.transaction(async (conn) => {
      if (isDefault && !existing.is_default) {
        await db.update(
          "addresses",
          { is_default: false },
          "user_id = ? AND is_default = ?",
          [userId, true],
          false,
          conn,
        );
      }

      await db.update(
        "addresses",
        {
          ...(input.fullName && { fullName: input.fullName }),
          ...(input.mobileNumber && { mobile_number: input.mobileNumber }),
          ...(input.email !== undefined && { email: input.email }),
          ...(input.pincode && { pincode: input.pincode }),
          ...(input.addressLine1 && { address_line_1: input.addressLine1 }),
          ...(input.addressLine2 !== undefined && { address_line_2: input.addressLine2 }),
          ...(input.city && { city: input.city }),
          ...(input.state && { state: input.state }),
          ...(input.country && { country: input.country }),
          ...(input.landmark !== undefined && { landmark: input.landmark }),
          ...(input.addressType && { address_type: input.addressType }),
          is_default: isDefault,
        },
        "id = ?",
        [id],
        false,
        conn,
      );

      const row = await db.select("addresses", "*", "id = ?", [id], false, conn);
      return mapAddress(row);
    });

    log.info({ addressId: id, userId }, "Address updated");
    return address;
  },

  /**
   * Soft delete address.
   */
  async delete(userId: string, id: number) {
    const existing = await db.select("addresses", "*", "id = ? AND user_id = ? AND deleted_at IS NULL", [id, userId]);
    if (!existing) throw AppError.notFound("Address");

    await db.update("addresses", { deleted_at: new Date(), is_default: false }, "id = ?", [id]);

    // If we deleted the default address, set another address as default
    if (existing.is_default) {
      const another = await db.select(
        "addresses",
        "*",
        "user_id = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1",
        [userId],
      );
      if (another) {
        await db.update("addresses", { is_default: true }, "id = ?", [another.id]);
      }
    }

    log.info({ addressId: id, userId }, "Address soft deleted");
  },
};

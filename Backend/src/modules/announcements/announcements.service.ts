import { db } from "../../database/mysql.js";
import { AppError } from "../../common/api-error.js";

function mapAnnouncement(row: any) {
  return {
    id: Number(row.id),
    text: row.text,
    sortOrder: Number(row.sort_order),
    isActive: Boolean(row.is_active),
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const announcementService = {
  async listActive() {
    const now = new Date();
    const rows = await db.queryAll(
      `SELECT * FROM ec_announcements
       WHERE is_active = 1 AND deleted_at IS NULL
         AND (starts_at IS NULL OR starts_at <= ?)
         AND (ends_at IS NULL OR ends_at >= ?)
       ORDER BY sort_order ASC`,
      [now, now],
    );
    return rows.map(mapAnnouncement);
  },

  async listAll() {
    const rows = await db.selectAll(
      "announcements",
      "*",
      "deleted_at IS NULL",
      [],
      "ORDER BY sort_order ASC",
    );
    return rows.map(mapAnnouncement);
  },

  async getById(id: number) {
    const row = await db.select("announcements", "*", "id = ? AND deleted_at IS NULL", [id]);
    if (!row) throw AppError.notFound("Announcement");
    return mapAnnouncement(row);
  },

  async create(input: {
    text: string;
    sortOrder?: number;
    isActive?: boolean;
    startsAt?: Date | null;
    endsAt?: Date | null;
  }) {
    const result = await db.insert("announcements", {
      text: input.text,
      sort_order: input.sortOrder ?? 0,
      is_active: input.isActive !== false ? 1 : 0,
      starts_at: input.startsAt ?? null,
      ends_at: input.endsAt ?? null,
    });
    return this.getById(Number(result.insertId));
  },

  async update(id: number, input: Partial<{
    text: string;
    sortOrder: number;
    isActive: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
  }>) {
    const existing = await db.select("announcements", "id", "id = ? AND deleted_at IS NULL", [id]);
    if (!existing) throw AppError.notFound("Announcement");
    await db.update(
      "announcements",
      {
        ...(input.text && { text: input.text }),
        ...(input.sortOrder !== undefined && { sort_order: input.sortOrder }),
        ...(input.isActive !== undefined && { is_active: input.isActive ? 1 : 0 }),
        ...(input.startsAt !== undefined && { starts_at: input.startsAt }),
        ...(input.endsAt !== undefined && { ends_at: input.endsAt }),
      },
      "id = ?",
      [id],
    );
    return this.getById(id);
  },

  async remove(id: number) {
    const existing = await db.select("announcements", "id", "id = ? AND deleted_at IS NULL", [id]);
    if (!existing) throw AppError.notFound("Announcement");
    await db.update("announcements", { deleted_at: new Date() }, "id = ?", [id]);
  },
};

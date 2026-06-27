import { db } from "../../database/mysql.js";
import { AppError } from "../../common/api-error.js";

function mapContent(row: any) {
  return {
    id: Number(row.id),
    key: row.content_key,
    value: typeof row.content_value === "string" ? JSON.parse(row.content_value) : row.content_value,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const siteContentService = {
  async getByKey(key: string) {
    const row = await db.select("site_content", "*", "content_key = ?", [key]);
    if (!row) throw AppError.notFound("Content");
    return mapContent(row);
  },

  async listAll() {
    const rows = await db.selectAll("site_content", "*", "1=1", [], "ORDER BY content_key ASC");
    return rows.map(mapContent);
  },

  async upsert(key: string, value: Record<string, unknown>) {
    const existing = await db.select("site_content", "id", "content_key = ?", [key]);
    if (existing) {
      await db.update("site_content", { content_value: JSON.stringify(value) }, "content_key = ?", [key]);
    } else {
      await db.insert("site_content", { content_key: key, content_value: JSON.stringify(value) });
    }
    return this.getByKey(key);
  },

  async remove(key: string) {
    const existing = await db.select("site_content", "id", "content_key = ?", [key]);
    if (!existing) throw AppError.notFound("Content");
    await db.delete("site_content", "content_key = ?", [key]);
  },
};

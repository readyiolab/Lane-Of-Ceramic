import { db } from "../database/mysql.js";
import { createModuleLogger } from "../utils/logger.js";

const log = createModuleLogger("audit");

export const auditService = {
  async log(input: {
    actorId: string;
    action: string;
    entity: string;
    entityId?: string | number | null;
    metadata?: Record<string, unknown>;
    ipAddress?: string | null;
  }) {
    try {
      await db.insert("admin_audit_logs", {
        actor_id: input.actorId,
        action: input.action,
        entity: input.entity,
        entity_id: input.entityId != null ? String(input.entityId) : null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        ip_address: input.ipAddress ?? null,
      });
    } catch (err) {
      log.error({ err }, "Failed to write audit log");
    }
  },

  async list(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const rows = await db.queryAll(
      `SELECT a.*, u.email as actor_email, u.fullName as actor_name
       FROM ec_admin_audit_logs a
       LEFT JOIN ec_users u ON a.actor_id = u.id
       ORDER BY a.created_at DESC
       LIMIT ${Number(limit)} OFFSET ${Number(skip)}`,
    );
    const countRow = await db.query("SELECT COUNT(*) as total FROM ec_admin_audit_logs");
    return {
      data: rows.map((r) => ({
        id: Number(r.id),
        actorId: r.actor_id,
        actorEmail: r.actor_email,
        actorName: r.actor_name,
        action: r.action,
        entity: r.entity,
        entityId: r.entity_id,
        metadata: typeof r.metadata === "string" ? JSON.parse(r.metadata) : r.metadata,
        ipAddress: r.ip_address,
        createdAt: r.created_at,
      })),
      total: Number(countRow?.total ?? 0),
      page,
      limit,
    };
  },
};

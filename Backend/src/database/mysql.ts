import mysql, { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { withRetry } from "../utils/retry.js";
import { createModuleLogger } from "../utils/logger.js";
import { env } from "../config/env.js";

const log = createModuleLogger("mysql");

// Parse DATABASE_URL into individual connection params
function parseDatabaseUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ""),
  };
}

// Retryable MySQL error codes
const RETRYABLE_DB_ERRORS = new Set([
  "PROTOCOL_CONNECTION_LOST",
  "PROTOCOL_SEQUENCE_TIMEOUT",
  "ER_LOCK_DEADLOCK",
  "ER_LOCK_WAIT_TIMEOUT",
  "ER_CON_COUNT_ERROR",
  "ECONNRESET",
  "ETIMEDOUT",
]);

class Database {
  private connectionLimit = 50;
  private isConnected = false;
  private isShuttingDown = false;
  private tablePrefix = "ec_";
  public pool: Pool;

  private getFullTableName(tbl_name: string): string {
    if (tbl_name.startsWith(this.tablePrefix)) return tbl_name;
    return `${this.tablePrefix}${tbl_name}`;
  }

  constructor() {
    const dbConfig = parseDatabaseUrl(env.DATABASE_URL);

    this.pool = mysql.createPool({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,

      waitForConnections: true,
      connectionLimit: this.connectionLimit,
      queueLimit: 0,

      timezone: "Z",
      multipleStatements: false,

      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });

    this.testConnection();
  }

  // Internal helper: execute with retry for transient errors.
  private async _executeWithRetry<T>(operation: () => Promise<T>, context = "DB"): Promise<T> {
    return withRetry(operation, {
      maxAttempts: 3,
      baseDelay: 500,
      maxDelay: 5000,
      context,
      retryIf: (error: any) =>
        RETRYABLE_DB_ERRORS.has(error.code) ||
        (error.message || "").toLowerCase().includes("deadlock"),
    });
  }

  async testConnection(): Promise<void> {
    if (this.isShuttingDown) return;

    try {
      const connection = await this.pool.getConnection();
      log.info(`MySQL connection pool ready (max ${this.connectionLimit} connections)`);
      this.isConnected = true;
      connection.release();
    } catch (err: any) {
      if (this.isShuttingDown) return;
      log.error({ err: err.message }, "Database pool error");
      this.isConnected = false;
      setTimeout(() => this.testConnection(), 5000);
    }
  }

  async healthCheck(): Promise<{ status: string; poolSize?: number; error?: string }> {
    try {
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      return {
        status: "healthy",
        poolSize: (this.pool as any).pool?._allConnections?.length || 0,
      };
    } catch (err: any) {
      return { status: "unhealthy", error: err.message };
    }
  }

  async select(
    tbl_name: string,
    column = "*",
    where = "",
    params: any[] = [],
    print = false,
    connection?: PoolConnection,
  ): Promise<RowDataPacket | undefined> {
    const fullTbl = this.getFullTableName(tbl_name);
    const wr = where !== "" ? `WHERE ${where}` : "";
    const sql = `SELECT ${column} FROM ${fullTbl} ${wr}`;
    if (print) log.debug({ sql, params }, "SQL");
    const safeParams = (params || []).map((v) => (v === undefined ? null : v));
    const executor = connection || this.pool;
    return this._executeWithRetry(async () => {
      const [results] = await executor.execute<RowDataPacket[]>(sql, safeParams);
      return results[0];
    }, "SELECT");
  }

  async selectAll(
    tbl_name: string,
    column = "*",
    where = "",
    params: any[] = [],
    orderby = "",
    print = false,
    connection?: PoolConnection,
  ): Promise<RowDataPacket[]> {
    const fullTbl = this.getFullTableName(tbl_name);
    const wr = where !== "" ? `WHERE ${where}` : "";
    const sql = `SELECT ${column} FROM ${fullTbl} ${wr} ${orderby}`;
    if (print) log.debug({ sql, params }, "SQL");
    const safeParams = (params || []).map((v) => (v === undefined ? null : v));
    const executor = connection || this.pool;
    return this._executeWithRetry(async () => {
      const [results] = await executor.execute<RowDataPacket[]>(sql, safeParams);
      return results;
    }, "SELECT_ALL");
  }

  async insert(
    tbl_name: string,
    data: Record<string, any>,
    print = false,
    connection?: PoolConnection,
  ): Promise<{ status: boolean; insertId: number; affected_rows: number; info: string }> {
    const fullTbl = this.getFullTableName(tbl_name);
    const fields = Object.keys(data).map((key) => `\`${key}\``).join(",");
    const placeholders = Object.keys(data).map(() => "?").join(",");
    const values = Object.values(data).map((v) => (v === undefined ? null : v));

    const sql = `INSERT INTO ${fullTbl}(${fields}) VALUES(${placeholders})`;
    if (print) log.debug({ sql, params: values }, "SQL");
    const executor = connection || this.pool;
    return this._executeWithRetry(async () => {
      const [result] = await executor.execute<ResultSetHeader>(sql, values);
      return {
        status: true,
        insertId: result.insertId,
        affected_rows: result.affectedRows,
        info: result.info,
      };
    }, "INSERT");
  }

  async upsert(
    tbl_name: string,
    data: Record<string, any>,
    updateData: Record<string, any> | null = null,
    print = false,
    connection?: PoolConnection,
  ): Promise<{ status: boolean; insertId: number; affected_rows: number; info: string }> {
    const fullTbl = this.getFullTableName(tbl_name);
    const fields = Object.keys(data).map((key) => `\`${key}\``).join(",");
    const placeholders = Object.keys(data).map(() => "?").join(",");
    const values = Object.values(data);

    const dataToUpdate = updateData || data;
    const updates = Object.entries(dataToUpdate)
      .filter(([key]) => key !== "id" && key !== "user_id")
      .map(([key]) => `\`${key}\` = VALUES(\`${key}\`)`);

    const sql = `INSERT INTO ${fullTbl}(${fields}) VALUES(${placeholders}) 
                 ON DUPLICATE KEY UPDATE ${updates.join(", ")}`;
    if (print) log.debug({ sql, params: values }, "SQL");
    const safeValues = values.map((v) => (v === undefined ? null : v));
    const executor = connection || this.pool;
    return this._executeWithRetry(async () => {
      const [result] = await executor.execute<ResultSetHeader>(sql, safeValues);
      return {
        status: true,
        insertId: result.insertId,
        affected_rows: result.affectedRows,
        info: result.info,
      };
    }, "UPSERT");
  }

  async update(
    table_name: string,
    form_data: Record<string, any>,
    where = "",
    params: any[] = [],
    print = false,
    connection?: PoolConnection,
  ): Promise<{ status: boolean; affected_rows: number; info: string }> {
    const fullTbl = this.getFullTableName(table_name);
    const whereSQL = where !== "" ? ` WHERE ${where}` : "";

    const sets = Object.entries(form_data).map(([column]) => `\`${column}\` = ?`);
    const values = Object.values(form_data).map((v) => (v === undefined ? null : v));
    const queryParams = [...values, ...params];

    const sql = `UPDATE ${fullTbl} SET ${sets.join(", ")}${whereSQL}`;
    if (print) log.debug({ sql, params: queryParams }, "SQL");
    const safeParams = queryParams.map((v) => (v === undefined ? null : v));
    const executor = connection || this.pool;
    return this._executeWithRetry(async () => {
      const [result] = await executor.execute<ResultSetHeader>(sql, safeParams);
      return {
        status: true,
        affected_rows: result.affectedRows,
        info: result.info,
      };
    }, "UPDATE");
  }

  async delete(
    tbl_name: string,
    where = "",
    params: any[] = [],
    print = false,
    connection?: PoolConnection,
  ): Promise<{ status: boolean; affected_rows: number; info: string }> {
    const fullTbl = this.getFullTableName(tbl_name);
    const whereSQL = where !== "" ? ` WHERE ${where}` : "";
    const sql = `DELETE FROM ${fullTbl}${whereSQL}`;
    if (print) log.debug({ sql, params }, "SQL");
    const safeParams = (params || []).map((v) => (v === undefined ? null : v));
    const executor = connection || this.pool;
    return this._executeWithRetry(async () => {
      const [result] = await executor.execute<ResultSetHeader>(sql, safeParams);
      return {
        status: true,
        affected_rows: result.affectedRows,
        info: result.info,
      };
    }, "DELETE");
  }

  async query(
    sql: string,
    params: any[] = [],
    print = false,
    connection?: PoolConnection,
  ): Promise<RowDataPacket | undefined> {
    if (print) log.debug({ sql, params }, "SQL");
    const safeParams = (params || []).map((v) => (v === undefined ? null : v));
    const executor = connection || this.pool;
    return this._executeWithRetry(async () => {
      const [results] = await executor.execute<RowDataPacket[]>(sql, safeParams);
      return results[0];
    }, "QUERY");
  }

  async queryOne(
    sql: string,
    params: any[] = [],
    print = false,
    connection?: PoolConnection,
  ): Promise<RowDataPacket | undefined> {
    return this.query(sql, params, print, connection);
  }

  async queryAll(
    sql: string,
    params: any[] = [],
    print = false,
    connection?: PoolConnection,
  ): Promise<RowDataPacket[]> {
    if (print) log.debug({ sql, params }, "SQL");
    const safeParams = (params || []).map((v) => (v === undefined ? null : v));
    const executor = connection || this.pool;
    return this._executeWithRetry(async () => {
      const [results] = await executor.execute<RowDataPacket[]>(sql, safeParams);
      return results;
    }, "QUERY_ALL");
  }

  async insertAll(
    sql: string,
    params: any[] = [],
    print = false,
    connection?: PoolConnection,
  ): Promise<{ status: boolean }> {
    if (print) log.debug({ sql, params }, "SQL");
    const executor = connection || this.pool;
    return this._executeWithRetry(async () => {
      await executor.execute(sql, params);
      return { status: true };
    }, "INSERT_ALL");
  }

  async count(
    tbl_name: string,
    where = "",
    params: any[] = [],
    print = false,
    connection?: PoolConnection,
  ): Promise<number> {
    const fullTbl = this.getFullTableName(tbl_name);
    const wr = where !== "" ? `WHERE ${where}` : "";
    const sql = `SELECT COUNT(*) as total FROM ${fullTbl} ${wr}`;
    if (print) log.debug({ sql, params }, "SQL");
    const safeParams = (params || []).map((v) => (v === undefined ? null : v));
    const executor = connection || this.pool;
    return this._executeWithRetry(async () => {
      const [results] = await executor.execute<RowDataPacket[]>(sql, safeParams);
      return results[0].total;
    }, "COUNT");
  }

  async beginTransaction(): Promise<PoolConnection> {
    const connection = await this.pool.getConnection();
    await connection.beginTransaction();
    return connection;
  }

  async commit(connection: PoolConnection): Promise<void> {
    await connection.commit();
    connection.release();
  }

  async rollback(connection: PoolConnection): Promise<void> {
    await connection.rollback();
    connection.release();
  }

  async transaction<T>(callback: (connection: PoolConnection) => Promise<T>): Promise<T> {
    const connection = await this.beginTransaction();
    try {
      const result = await callback(connection);
      await this.commit(connection);
      return result;
    } catch (error) {
      await this.rollback(connection);
      throw error;
    }
  }

  async hasTable(tableName: string): Promise<boolean> {
    const fullTbl = this.getFullTableName(tableName);
    const sql = `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`;
    const result = await this.query(sql, [fullTbl]);
    return (result?.count ?? 0) > 0;
  }

  async hasColumn(tableName: string, columnName: string): Promise<boolean> {
    const fullTbl = this.getFullTableName(tableName);
    const sql = `SELECT COUNT(*) as count FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`;
    const result = await this.query(sql, [fullTbl, columnName]);
    return (result?.count ?? 0) > 0;
  }

  async close(): Promise<void> {
    this.isShuttingDown = true;
    log.info("Closing MySQL database pool...");
    await this.pool.end();
    log.info("MySQL database pool closed");
  }
}

export const db = new Database();
export default db;

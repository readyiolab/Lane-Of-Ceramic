import { Redis } from "ioredis";
import { env } from "../config/env.js";
import { createModuleLogger } from "../utils/logger.js";

const log = createModuleLogger("redis");
const KEY_PREFIX = "cs:";

interface StoreEntry {
  value: string;
  expiresAt: number;
}

/** In-memory Redis substitute for local dev without Redis server */
class MemoryRedis {
  private store = new Map<string, StoreEntry>();

  private fullKey(key: string): string {
    return key.startsWith(KEY_PREFIX) ? key : `${KEY_PREFIX}${key}`;
  }

  private isExpired(entry: StoreEntry): boolean {
    return entry.expiresAt > 0 && entry.expiresAt < Date.now();
  }

  private cleanup(key: string, entry: StoreEntry): void {
    if (this.isExpired(entry)) this.store.delete(key);
  }

  async set(key: string, value: string, ...args: unknown[]): Promise<"OK"> {
    const full = this.fullKey(key);
    let ttlSeconds = 0;
    if (args[0] === "EX" && typeof args[1] === "number") {
      ttlSeconds = args[1];
    }
    const expiresAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : 0;
    this.store.set(full, { value, expiresAt });
    return "OK";
  }

  async get(key: string): Promise<string | null> {
    const full = this.fullKey(key);
    const entry = this.store.get(full);
    if (!entry) return null;
    if (this.isExpired(entry)) {
      this.store.delete(full);
      return null;
    }
    return entry.value;
  }

  async del(...keys: string[]): Promise<number> {
    let removed = 0;
    for (const key of keys) {
      const full = this.fullKey(key);
      if (this.store.delete(full)) removed++;
    }
    return removed;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = this.globToRegex(this.fullKey(pattern));
    const matches: string[] = [];
    for (const [key, entry] of this.store.entries()) {
      this.cleanup(key, entry);
      if (!this.store.has(key)) continue;
      if (regex.test(key)) matches.push(key);
    }
    return matches;
  }

  scanStream(options: { match: string; count: number }) {
    const regex = this.globToRegex(options.match.startsWith(KEY_PREFIX) ? options.match : `${KEY_PREFIX}${options.match}`);
    const matching = [...this.store.keys()].filter((key) => {
      const entry = this.store.get(key);
      if (entry && this.isExpired(entry)) {
        this.store.delete(key);
        return false;
      }
      return regex.test(key);
    });

    let index = 0;
    return {
      async *[Symbol.asyncIterator]() {
        while (index < matching.length) {
          yield matching.slice(index, index + options.count);
          index += options.count;
        }
      },
    };
  }

  pipeline() {
    const ops: Array<() => void> = [];
    const self = this;
    return {
      del(key: string) {
        ops.push(() => {
          void self.del(key);
        });
        return this;
      },
      async exec() {
        ops.forEach((op) => op());
        return [];
      },
    };
  }

  private globToRegex(glob: string): RegExp {
    const escaped = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
    return new RegExp(`^${escaped}$`);
  }
}

function createRedisClient(): Redis {
  if (!env.REDIS_ENABLED) {
    log.warn("REDIS_ENABLED=false — using in-memory store (sessions/cache). Enable Redis in production.");
    return new MemoryRedis() as unknown as Redis;
  }

  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    retryStrategy(times: number) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    keyPrefix: KEY_PREFIX,
    enableReadyCheck: false,
    lazyConnect: true,
  });

  client.on("connect", () => log.info("Redis connected"));
  client.on("ready", () => log.info("Redis ready"));
  client.on("error", (err: any) => log.error({ err: err.message }, "Redis error"));
  client.connect().catch((err: any) => log.error({ err: err.message }, "Redis connect failed"));

  return client;
}

export const redis = createRedisClient();

/** Helper: set with TTL */
export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    log.error({ key, err }, "Cache set error");
  }
}

/** Helper: get parsed value */
export async function cacheGet<T = unknown>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    log.error({ key, err }, "Cache get error");
    return null;
  }
}

/** Helper: delete cache key(s) */
export async function cacheDel(...keys: string[]): Promise<void> {
  try {
    if (keys.length > 0) await redis.del(...keys);
  } catch (err) {
    log.error({ keys, err }, "Cache delete error");
  }
}

/** Helper: delete all keys matching pattern */
export async function cacheInvalidatePattern(pattern: string): Promise<void> {
  try {
    const stream = redis.scanStream({ match: pattern, count: 100 });
    const pipeline = redis.pipeline();
    let count = 0;

    for await (const keys of stream) {
      for (const key of keys as string[]) {
        const stripped = key.startsWith(KEY_PREFIX) ? key.slice(KEY_PREFIX.length) : key;
        pipeline.del(stripped);
        count++;
      }
    }

    if (count > 0) {
      await pipeline.exec();
      log.debug({ pattern, count }, "Cache pattern invalidated");
    }
  } catch (err) {
    log.error({ pattern, err }, "Cache pattern invalidation error");
  }
}

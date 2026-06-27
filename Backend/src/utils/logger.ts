import pino from "pino";
import { createRequire } from "module";
import { env } from "../config/env.js";

const require = createRequire(import.meta.url);
const isDev = env.NODE_ENV === "development";

let hasPinoPretty = false;
try {
  require.resolve("pino-pretty");
  hasPinoPretty = true;
} catch (e) {
  // Not installed
}

export const logger = pino({
  level: isDev ? "debug" : "info",
  transport: (isDev && hasPinoPretty)
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
          ignore: "pid,hostname",
        },
      }
    : undefined,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "body.password",
      "body.passwordHash",
      "body.oldPassword",
      "body.newPassword",
    ],
    censor: "[REDACTED]",
  },
});

/** Create a child logger for a specific module */
export function createModuleLogger(module: string) {
  return logger.child({ module });
}

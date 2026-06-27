import pinoHttp from "pino-http";
import { logger } from "../utils/logger.js";
import { generateUUID } from "../utils/crypto.js";

export const requestLogger = (pinoHttp as any)({
  logger,
  genReqId: () => generateUUID().slice(0, 8),
  autoLogging: {
    ignore: (req: any) => {
      // Skip health check noise
      return req.url === "/api/v1/health";
    },
  },
  customSuccessMessage: (_req: any, res: any) => {
    return `${res.statusCode} ${res.statusMessage}`;
  },
  customErrorMessage: (_req: any, res: any) => {
    return `${res.statusCode} request failed`;
  },
  serializers: {
    req(req: any) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        remoteAddress: req.remoteAddress,
      };
    },
    res(res: any) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});

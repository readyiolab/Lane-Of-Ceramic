import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import hpp from "hpp";
import swaggerUi from "swagger-ui-express";
import { randomUUID } from "crypto";
import { env, getCorsOrigins } from "./config/env.js";
import { rateLimiter } from "./middlewares/rate-limit.middleware.js";
import { requestLogger } from "./middlewares/request-logger.middleware.js";
import { sanitizeInput } from "./middlewares/sanitize.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { router } from "./routes/index.js";
import { swaggerSpec } from "./docs/swagger.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: getCorsOrigins(), credentials: true }));
app.use(rateLimiter);
app.use((req, _res, next) => {
  req.headers["x-request-id"] = req.headers["x-request-id"] ?? randomUUID();
  next();
});
app.use(requestLogger);
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(hpp());
app.use(sanitizeInput);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(env.API_PREFIX, router);
app.use(errorHandler);

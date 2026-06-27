import { Queue } from "bullmq";
import { redis } from "../database/redis.js";
export const notificationQueue = new Queue("notification-queue", { connection: redis });

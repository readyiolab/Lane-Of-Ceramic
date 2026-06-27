import { Worker } from "bullmq";
import { redis } from "../database/redis.js";

new Worker("notification-queue", async (job) => {
  console.log("Processing notification job", job.name, job.data);
}, { connection: redis });

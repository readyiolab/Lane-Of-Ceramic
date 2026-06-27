import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

console.log("Connecting to Redis using URL from env...");
console.log("REDIS_URL:", process.env.REDIS_URL ? "Set" : "Not Set");

if (!process.env.REDIS_URL) {
  console.error("REDIS_URL is not set in environment!");
  process.exit(1);
}

const client = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

client.on("connect", () => console.log("✓ Redis connected event fired"));
client.on("error", (err) => console.error("✗ Redis error:", err.message));

async function main() {
  console.log("Sending ping...");
  const pong = await client.ping();
  console.log("Response:", pong);

  console.log("Setting key test-key...");
  await client.set("test-key", "hello-from-local-" + Date.now());

  console.log("Getting key test-key...");
  const val = await client.get("test-key");
  console.log("Value:", val);

  console.log("Cleaning up...");
  await client.del("test-key");

  await client.quit();
  console.log("Done!");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

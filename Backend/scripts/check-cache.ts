import { config } from "dotenv";
import { resolve } from "path";
import { Redis } from "ioredis";

// Load environment variables from .env file
config({ path: resolve(process.cwd(), ".env") });

async function checkCache() {
  const url = process.env.REDIS_URL;

  if (!url) {
    console.error("❌ REDIS_URL environment variable is not set.");
    process.exit(1);
  }

  console.log("🔍 Connecting to Upstash Redis to check cache keys...");
  const client = new Redis(url, {
    enableReadyCheck: false,
    maxRetriesPerRequest: 3,
  });

  client.on("connect", () => {
    console.log("✓ Redis connected");
  });

  try {
    // Wait briefly for connection
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get all keys
    console.log("\n📦 Fetching all keys from Redis...");
    const keys = await client.keys("*");
    
    if (keys.length === 0) {
      console.log("⚠️ The cache is currently EMPTY.");
      console.log("👉 Tip: Try loading the frontend or making a GET request to /api/v1/brands or /api/v1/categories to populate the cache!");
    } else {
      console.log(`✅ Found ${keys.length} keys in cache:`);
      keys.forEach(k => console.log(`   - ${k}`));
      
      // Let's check some common keys
      if (keys.includes("brands:all")) {
        console.log("\n👀 Content of 'brands:all':");
        const brands = await client.get("brands:all");
        console.log(brands ? brands.substring(0, 300) + "..." : "null");
      }
      if (keys.includes("categories:all")) {
        console.log("\n👀 Content of 'categories:all':");
        const categories = await client.get("categories:all");
        console.log(categories ? categories.substring(0, 300) + "..." : "null");
      }
    }

  } catch (error) {
    console.error("❌ Redis Error:", error);
  } finally {
    console.log("\n🧹 Cleaning up...");
    client.quit();
  }
}

checkCache();

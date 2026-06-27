/**
 * Smoke test — run with backend on :3000
 * npx tsx scripts/smoke-test.ts
 */
const API = process.env.API_BASE || "http://localhost:3000/api/v1";

async function check(name: string, url: string, expectStatus = 200) {
  const res = await fetch(`${API}${url}`);
  if (res.status !== expectStatus) {
    throw new Error(`${name}: expected ${expectStatus}, got ${res.status}`);
  }
  const json = await res.json();
  if (!json.success) throw new Error(`${name}: success=false`);
  console.log(`✓ ${name}`);
  return json;
}

async function main() {
  const base = API.replace("/api/v1", "");
  const health = await fetch(`${base}/api/v1/health`);
  if (!health.ok) throw new Error(`health: ${health.status}`);
  console.log("✓ health");
  await check("products", "/products?limit=5");
  await check("categories", "/categories");
  await check("bundles", "/bundles/active");
  await check("discount-tiers", "/discount-tiers");
  await check("announcements", "/announcements/active");
  console.log("\nAll smoke tests passed.");
}

main().catch((err) => {
  console.error("Smoke test failed:", err.message);
  process.exit(1);
});

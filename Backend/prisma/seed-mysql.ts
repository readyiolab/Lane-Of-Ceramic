/**
 * MySQL seed script — run with: npx tsx prisma/seed-mysql.ts
 * Seeds categories, bundles, discount tiers, announcements, and admin user.
 */
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const host = process.env.DB_HOST || "127.0.0.1";
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASS || "";
  const database = process.env.DB_NAME || "laneofceramic";

  const conn = await mysql.createConnection({ host, port, user, password, database, multipleStatements: true });

  const migrationFiles = ["000_init_schema.sql", "001_admin_platform.sql"];
  for (const file of migrationFiles) {
    const migration = readFileSync(join(__dirname, "migrations", file), "utf8");
    const statements = migration.split(";").map((s) => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      try {
        await conn.query(stmt);
      } catch (err: any) {
        if (!err.message?.includes("Duplicate") && !err.message?.includes("already exists")) {
          console.warn(`Migration ${file} warning:`, err.message);
        }
      }
    }
  }

  const categories = [
    { name: "Drinkware", slug: "drinkware", subtitle: "Cups, mugs & more", sort: 1 },
    { name: "Tableware", slug: "tableware", subtitle: "Plates, bowls & sets", sort: 2 },
    { name: "Serveware", slug: "serveware", subtitle: "Serving bowls & platters", sort: 3 },
    { name: "Kitchenware", slug: "kitchenware", subtitle: "Canisters & kitchen essentials", sort: 4 },
  ];

  for (const cat of categories) {
    const [rows] = await conn.query<any[]>("SELECT id FROM ec_categories WHERE slug = ?", [cat.slug]);
    if (rows.length === 0) {
      await conn.query(
        "INSERT INTO ec_categories (name, slug, is_active) VALUES (?, ?, 1)",
        [cat.name, cat.slug],
      );
    }
  }

  const bundles = [
    { slug: "trio", label: "Pick Any 3", tagline: "Build your trio", itemCount: 3, price: 999 },
    { slug: "five", label: "Pick Any 5", tagline: "Best value bundle", itemCount: 5, price: 1499 },
  ];
  for (const b of bundles) {
    const [rows] = await conn.query<any[]>("SELECT id FROM ec_bundle_offers WHERE slug = ?", [b.slug]);
    if (rows.length === 0) {
      await conn.query(
        "INSERT INTO ec_bundle_offers (slug, label, tagline, item_count, price, is_active) VALUES (?, ?, ?, ?, ?, 1)",
        [b.slug, b.label, b.tagline, b.itemCount, b.price],
      );
    }
  }

  const tiers = [
    { threshold: 0, label: "Standard Shipping", icon: "📦", discountPct: 0, shipping: 99, sort: 0 },
    { threshold: 999, label: "Free Shipping", icon: "🚚", discountPct: 0, shipping: 0, sort: 1 },
    { threshold: 1550, label: "Flat 15% Discount", icon: "🎁", discountPct: 15, shipping: 0, sort: 2 },
    { threshold: 2500, label: "Flat 20% Discount", icon: "🔥", discountPct: 20, shipping: 0, sort: 3 },
  ];
  const [tierCount] = await conn.query<any[]>("SELECT COUNT(*) as c FROM ec_discount_tiers");
  if (Number(tierCount[0].c) === 0) {
    for (const t of tiers) {
      await conn.query(
        "INSERT INTO ec_discount_tiers (threshold, label, icon, discount_pct, shipping, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)",
        [t.threshold, t.label, t.icon, t.discountPct, t.shipping, t.sort],
      );
    }
  }

  const announcements = [
    "Free shipping on orders above ₹999",
    "Handcrafted ceramics — kiln-fired at 1260°C",
    "Bundle any 3 pieces for just ₹999",
  ];
  const [annCount] = await conn.query<any[]>("SELECT COUNT(*) as c FROM ec_announcements");
  if (Number(annCount[0].c) === 0) {
    for (let i = 0; i < announcements.length; i++) {
      await conn.query(
        "INSERT INTO ec_announcements (text, sort_order, is_active) VALUES (?, ?, 1)",
        [announcements[i], i],
      );
    }
  }

  const adminEmail = process.env.ADMIN_EMAIL || "admin@laneofceramic.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";
  const [adminRows] = await conn.query<any[]>("SELECT id FROM ec_users WHERE email = ?", [adminEmail]);
  if (adminRows.length === 0) {
    const hash = await bcrypt.hash(adminPassword, 12);
    await conn.query(
      `INSERT INTO ec_users (id, email, fullName, passwordHash, role, isActive, is_email_verified)
       VALUES (?, ?, ?, ?, 'SUPER_ADMIN', 1, 1)`,
      [uuidv4(), adminEmail, "Admin User", hash],
    );
    console.log(`Admin created: ${adminEmail} / ${adminPassword}`);
  }

  await conn.end();
  console.log("Seed completed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

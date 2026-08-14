import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { env } from "@oasis/config";

async function main() {
  const e = env();
  const pool = new Pool({ connectionString: e.DATABASE_URL });
  const db = drizzle(pool);
  console.log(`[db] migrating → ${e.DATABASE_URL.split("@")[1] ?? e.DATABASE_URL}`);
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("[db] migrations complete");
  await pool.end();
}

main().catch((err) => {
  console.error("[db] migration failed", err);
  process.exit(1);
});

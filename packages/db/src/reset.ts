import { Pool } from "pg";
import { env } from "@oasis/config";

async function main() {
  const e = env();
  const dbName = new URL(e.DATABASE_URL).pathname.slice(1);
  const base = new URL(e.DATABASE_URL);
  base.pathname = "/postgres";
  const pool = new Pool({ connectionString: base.toString() });
  console.log(`[db] dropping schema for database "${dbName}"`);
  await pool.query(`DROP SCHEMA IF EXISTS public CASCADE;`);
  await pool.query(`CREATE SCHEMA public;`);
  await pool.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
  await pool.end();
  console.log("[db] schema reset. Run `pnpm db:migrate` then `pnpm db:seed`.");
}

main().catch((err) => {
  console.error("[db] reset failed", err);
  process.exit(1);
});

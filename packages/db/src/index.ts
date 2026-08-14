import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { env } from "@oasis/config";

export type Database = NodePgDatabase<typeof schema>;

export function createDb(url = env().DATABASE_URL, max = 10): Database {
  const pool = new Pool({ connectionString: url, max });
  return drizzle(pool, { schema });
}

export { schema };

export * from "./schema";

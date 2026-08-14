import "server-only";
import { createDb } from "@oasis/db";

let cached: ReturnType<typeof createDb> | null = null;

export function db() {
  if (!cached) cached = createDb();
  return cached;
}

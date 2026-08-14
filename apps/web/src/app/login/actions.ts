"use server";

import { eq, sql } from "drizzle-orm";
import { verify } from "argon2";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";

export interface LoginState {
  error?: string;
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const dbs = db();
  const users = await dbs
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);

  if (users.length === 0) {
    return { error: "Invalid credentials." };
  }

  const user = users[0];
  const ok = await verify(user.passwordHash, password).catch(() => false);
  if (!ok) {
    return { error: "Invalid credentials." };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0] ?? undefined;
  await dbs
    .update(schema.users)
    .set({ lastLoginAt: new Date(), updatedAt: sql`now()` })
    .where(eq(schema.users.id, user.id));
  await createSession(user.id, ip);
  redirect("/admin");
}

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, checkCredentials, createSession } from "@/lib/auth";

export async function login(_prev: string | null, form: FormData): Promise<string | null> {
  const user = String(form.get("user") ?? "");
  if (!checkCredentials(user, String(form.get("password") ?? ""))) {
    return "Wrong credentials. The pizza remains unscented.";
  }
  (await cookies()).set(SESSION_COOKIE, await createSession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  const next = String(form.get("next") ?? "");
  redirect(next.startsWith("/crm") ? next : "/crm");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}

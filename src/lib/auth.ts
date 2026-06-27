import { cookies } from "next/headers";
import { validateAdminCredentials } from "./users";
import type { AdminUser } from "./types";

export const AUTH_COOKIE = "mas-cafe-admin";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get(AUTH_COOKIE)?.value);
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const username = cookieStore.get(AUTH_COOKIE)?.value;
  if (!username) return null;

  const { getAdminUsers } = await import("./users");
  const users = await getAdminUsers();
  return users.find((u) => u.username === username) ?? null;
}

export async function createSessionValue(
  username: string,
  password: string,
): Promise<string | null> {
  const user = await validateAdminCredentials(username, password);
  return user ? user.username : null;
}

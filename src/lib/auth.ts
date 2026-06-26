import { cookies } from "next/headers";

export const AUTH_COOKIE = "mas-cafe-admin";
const SESSION_VALUE = "authenticated";

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "mascafe2025";
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value === SESSION_VALUE;
}

export function createSessionValue(password: string): string | null {
  return password === getAdminPassword() ? SESSION_VALUE : null;
}

import { readFile } from "fs/promises";
import path from "path";
import type { AdminUser } from "./types";

const USERS_PATH = path.join(process.cwd(), "content", "users.json");

let cachedUsers: AdminUser[] | null = null;

export async function getAdminUsers(): Promise<AdminUser[]> {
  if (cachedUsers) return cachedUsers;

  try {
    const raw = await readFile(USERS_PATH, "utf-8");
    cachedUsers = JSON.parse(raw) as AdminUser[];
    return cachedUsers;
  } catch {
    return [
      {
        username: "admin",
        password: process.env.ADMIN_PASSWORD ?? "mascafe2025",
        name: "Administrador",
        role: "admin",
      },
    ];
  }
}

export async function validateAdminCredentials(
  username: string,
  password: string,
): Promise<AdminUser | null> {
  const users = await getAdminUsers();
  const user = users.find(
    (u) => u.username === username && u.password === password,
  );
  return user ?? null;
}

import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  getContentProvider,
  getSettings,
  getSyncLogs,
  runHealthCheck,
  saveSettings,
} from "@/lib/store";
import { getAdminUsers } from "@/lib/users";
import type { SiteSettings } from "@/lib/types";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [health, settings, logs, users] = await Promise.all([
    runHealthCheck(),
    getSettings(),
    getSyncLogs(10),
    getAdminUsers(),
  ]);

  return NextResponse.json({
    health,
    settings,
    logs,
    provider: getContentProvider(),
    users: users.map(({ username, name, role }) => ({ username, name, role })),
    godaddy: {
      nodeVersion: process.version,
      outputMode: process.env.GODADDY_OUTPUT_MODE ?? "standalone",
      domain: process.env.GODADDY_DOMAIN ?? "mascafecol.com",
    },
  });
}

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const partial = (await request.json()) as Partial<SiteSettings>;
  const current = await getSettings();
  const updated = { ...current, ...partial };
  await saveSettings(updated);
  return NextResponse.json({ ok: true, settings: updated });
}

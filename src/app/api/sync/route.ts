import { NextResponse } from "next/server";
import {
  addSyncLog,
  getSettings,
  getSyncLogs,
  runHealthCheck,
  saveContent,
  saveSettings,
} from "@/lib/store";
import type { SiteContent } from "@/lib/types";

function verifyAppsScriptSecret(request: Request): boolean {
  const secret = process.env.APPS_SCRIPT_SECRET;
  if (!secret) return false;
  const header = request.headers.get("x-apps-script-secret");
  return header === secret;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "health") {
    const health = await runHealthCheck();
    return NextResponse.json(health);
  }

  if (action === "logs") {
    const logs = await getSyncLogs(20);
    return NextResponse.json(logs);
  }

  if (action === "settings") {
    const settings = await getSettings();
    return NextResponse.json(settings);
  }

  return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
}

export async function POST(request: Request) {
  if (!verifyAppsScriptSecret(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      action: "sync_content" | "ping";
      content?: SiteContent;
      message?: string;
      filesProcessed?: number;
    };

    if (body.action === "ping") {
      await addSyncLog({
        source: "google_apps_script",
        status: "success",
        message: body.message ?? "Ping desde Google Apps Script",
      });
      return NextResponse.json({ ok: true, message: "Conexión exitosa" });
    }

    if (body.action === "sync_content" && body.content) {
      await saveContent(body.content);
      const settings = await getSettings();
      await saveSettings({ ...settings, lastSyncAt: Date.now() });
      await addSyncLog({
        source: "google_apps_script",
        status: "success",
        message: "Contenido sincronizado desde Google Drive",
        filesProcessed: body.filesProcessed,
      });
      return NextResponse.json({ ok: true });
    }

    await addSyncLog({
      source: "google_apps_script",
      status: "error",
      message: "Payload inválido",
    });
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  } catch (error) {
    await addSyncLog({
      source: "google_apps_script",
      status: "error",
      message: error instanceof Error ? error.message : "Error desconocido",
    });
    return NextResponse.json({ error: "Error en sincronización" }, { status: 500 });
  }
}

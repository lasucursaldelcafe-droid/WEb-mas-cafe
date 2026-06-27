import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getAnalyticsSummary, trackAnalyticsEvent } from "@/lib/store";
import type { AnalyticsEvent } from "@/lib/types";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const summary = await getAnalyticsSummary();
  return NextResponse.json(summary);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Omit<
      AnalyticsEvent,
      "id" | "timestamp"
    >;
    if (!body.type || !body.path) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    await trackAnalyticsEvent(body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al registrar" }, { status: 500 });
  }
}

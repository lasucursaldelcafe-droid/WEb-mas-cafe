"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/admin/AdminForms";
import type { AnalyticsSummary } from "@/lib/types";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/analytics")
      .then((r) => r.json())
      .then((d: AnalyticsSummary) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-charcoal/60">Cargando analytics...</p>;
  }

  if (!data) {
    return <p className="text-cherry">No se pudieron cargar los datos</p>;
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-4xl text-blue-deep">Analytics</h1>
        <p className="mt-2 text-charcoal/60">
          Métricas de visitas y eventos del sitio
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard label="Total visitas" value={data.totalViews} />
        <StatCard label="Hoy" value={data.viewsToday} accent="text-green" />
        <StatCard label="Esta semana" value={data.viewsWeek} accent="text-brown-light" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.5rem_2.5rem_1.5rem_2.5rem] border border-blue-deep/8 bg-white p-8">
          <h2 className="font-display text-xl text-blue-deep">Top páginas</h2>
          <ul className="mt-6 space-y-3">
            {data.topPages.map((p) => (
              <li key={p.path} className="flex items-center justify-between">
                <span className="text-sm">{p.path}</span>
                <div className="flex items-center gap-3">
                  <div
                    className="h-2 rounded-full bg-sage"
                    style={{
                      width: `${Math.max(20, (p.count / (data.topPages[0]?.count ?? 1)) * 120)}px`,
                    }}
                  />
                  <span className="text-sm font-medium text-blue-deep">
                    {p.count}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[1.5rem_2.5rem_1.5rem_2.5rem] border border-blue-deep/8 bg-white p-8">
          <h2 className="font-display text-xl text-blue-deep">Eventos recientes</h2>
          <ul className="mt-6 max-h-80 space-y-3 overflow-y-auto">
            {data.recentEvents.map((e) => (
              <li key={e.id} className="border-b border-blue-deep/5 pb-3 text-sm">
                <span className="font-medium text-blue-deep">{e.type}</span>
                {" · "}
                {e.path}
                <br />
                <span className="text-xs text-charcoal/50">
                  {new Date(e.timestamp).toLocaleString("es-CO")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

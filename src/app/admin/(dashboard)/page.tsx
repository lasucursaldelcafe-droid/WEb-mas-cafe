import Link from "next/link";
import { StatCard } from "@/components/admin/AdminForms";
import {
  getAnalyticsSummary,
  getContent,
  getContentProvider,
  getSyncLogs,
  runHealthCheck,
} from "@/lib/store";

export default async function AdminDashboard() {
  const [content, analytics, health, logs] = await Promise.all([
    getContent(),
    getAnalyticsSummary(),
    runHealthCheck(),
    getSyncLogs(3),
  ]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-4xl text-blue-deep">Dashboard</h1>
          <p className="mt-2 text-charcoal/60">
            Panel de administración · Proveedor:{" "}
            <span className="font-medium text-blue-deep">
              {getContentProvider()}
            </span>
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full bg-green/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-green">
          Sitio público
        </span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Visitas hoy" value={analytics.viewsToday} accent="text-green" />
        <StatCard label="Visitas semana" value={analytics.viewsWeek} />
        <StatCard label="Productos" value={content.products.length} />
        <StatCard
          label="Estado sistema"
          value={health.status === "ok" ? "OK" : health.status.toUpperCase()}
          accent={health.status === "ok" ? "text-green" : "text-cherry"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.5rem_2.5rem_1.5rem_2.5rem] border border-blue-deep/8 bg-white p-8">
          <h2 className="font-display text-2xl text-blue-deep">Páginas más visitadas</h2>
          <ul className="mt-6 space-y-3">
            {analytics.topPages.length === 0 ? (
              <li className="text-sm text-charcoal/50">Sin datos aún</li>
            ) : (
              analytics.topPages.map((p) => (
                <li key={p.path} className="flex justify-between text-sm">
                  <span className="text-charcoal/80">{p.path}</span>
                  <span className="font-medium text-blue-deep">{p.count}</span>
                </li>
              ))
            )}
          </ul>
          <Link href="/admin/analytics" className="mt-6 inline-block text-sm text-blue-deep hover:underline">
            Ver analytics completo →
          </Link>
        </div>

        <div className="rounded-[1.5rem_2.5rem_1.5rem_2.5rem] border border-blue-deep/8 bg-white p-8">
          <h2 className="font-display text-2xl text-blue-deep">Últimas sincronizaciones</h2>
          <ul className="mt-6 space-y-4">
            {logs.length === 0 ? (
              <li className="text-sm text-charcoal/50">Sin sincronizaciones</li>
            ) : (
              logs.map((log) => (
                <li key={log.id} className="text-sm">
                  <span
                    className={
                      log.status === "success" ? "text-green" : "text-cherry"
                    }
                  >
                    {log.status}
                  </span>
                  {" · "}
                  {log.message}
                </li>
              ))
            )}
          </ul>
          <Link href="/admin/sync" className="mt-6 inline-block text-sm text-blue-deep hover:underline">
            Configurar Google Sync →
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/admin/analytics", label: "Analytics", desc: "Visitas y eventos" },
          { href: "/admin/productos", label: "Productos", desc: "Cafés y precios" },
          { href: "/admin/sync", label: "Google Sync", desc: "Drive y Apps Script" },
          { href: "/admin/sistema", label: "Sistema", desc: "Salud y GoDaddy" },
          { href: "/admin/configuracion", label: "Configuración", desc: "Marca y acceso" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-[1.5rem_2.5rem_1.5rem_2.5rem] border border-blue-deep/8 bg-white p-6 transition hover:shadow-md"
          >
            <h2 className="font-display text-xl text-blue-deep">{item.label}</h2>
            <p className="mt-2 text-sm text-charcoal/60">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

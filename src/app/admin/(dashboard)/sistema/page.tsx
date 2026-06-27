"use client";

import { useEffect, useState } from "react";
import type { SiteSettings, SyncLog, SystemHealth } from "@/lib/types";

type SystemData = {
  health: SystemHealth;
  settings: SiteSettings;
  logs: SyncLog[];
  provider: string;
  godaddy: { nodeVersion: string; outputMode: string; domain: string };
  users: { username: string; name: string; role: string }[];
};

export default function AdminSistemaPage() {
  const [data, setData] = useState<SystemData | null>(null);

  useEffect(() => {
    void fetch("/api/system")
      .then((r) => r.json())
      .then((d: SystemData) => setData(d));
  }, []);

  if (!data) {
    return <p className="text-charcoal/60">Cargando estado del sistema...</p>;
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-4xl text-blue-deep">Sistema</h1>
        <p className="mt-2 text-charcoal/60">
          Salud del proyecto y preparación para GoDaddy
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[1.5rem_2.5rem_1.5rem_2.5rem] border border-blue-deep/8 bg-white p-6">
          <p className="text-xs uppercase tracking-wider text-charcoal/50">Estado</p>
          <p className={`mt-2 font-display text-3xl ${
            data.health.status === "ok" ? "text-green" : "text-cherry"
          }`}>
            {data.health.status.toUpperCase()}
          </p>
        </div>
        <div className="rounded-[1.5rem_2.5rem_1.5rem_2.5rem] border border-blue-deep/8 bg-white p-6">
          <p className="text-xs uppercase tracking-wider text-charcoal/50">Datos</p>
          <p className="mt-2 font-display text-3xl text-blue-deep">{data.provider}</p>
        </div>
        <div className="rounded-[1.5rem_2.5rem_1.5rem_2.5rem] border border-blue-deep/8 bg-white p-6">
          <p className="text-xs uppercase tracking-wider text-charcoal/50">GoDaddy</p>
          <p className="mt-2 font-display text-3xl text-blue-deep">
            {data.settings.godaddyReady ? "Listo" : "Pendiente"}
          </p>
        </div>
      </div>

      <div className="rounded-[1.5rem_2.5rem_1.5rem_2.5rem] border border-blue-deep/8 bg-white p-8">
        <h2 className="font-display text-xl text-blue-deep">Usuarios del panel</h2>
        <p className="mt-2 text-sm text-charcoal/60">
          Solo el panel admin requiere acceso. El sitio web es público.
        </p>
        <ul className="mt-6 space-y-3">
          {data.users.map((user) => (
            <li
              key={user.username}
              className="flex items-center justify-between rounded-xl bg-cream px-4 py-3 text-sm"
            >
              <div>
                <span className="font-medium text-blue-deep">{user.name}</span>
                <span className="ml-2 text-charcoal/50">@{user.username}</span>
              </div>
              <span className="rounded-full bg-sage/30 px-3 py-1 text-xs font-medium text-blue-deep">
                {user.role}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {data.health.brokenAssets.length > 0 && (
        <div className="rounded-[1.5rem_2.5rem_1.5rem_2.5rem] border border-cherry/30 bg-cherry/5 p-8">
          <h2 className="font-display text-xl text-cherry">Assets rotos</h2>
          <ul className="mt-4 space-y-1 font-mono text-sm text-cherry/80">
            {data.health.brokenAssets.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {data.health.envMissing.length > 0 && (
        <div className="rounded-[1.5rem_2.5rem_1.5rem_2.5rem] border border-brown-light/30 bg-sage/20 p-8">
          <h2 className="font-display text-xl text-blue-deep">Variables pendientes</h2>
          <ul className="mt-4 space-y-1 font-mono text-sm text-charcoal/70">
            {data.health.envMissing.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-[1.5rem_2.5rem_1.5rem_2.5rem] border border-blue-deep/8 bg-white p-8">
        <h2 className="font-display text-xl text-blue-deep">Migración GoDaddy</h2>
        <ul className="mt-4 space-y-2 text-sm text-charcoal/70">
          <li>Dominio objetivo: <strong>{data.godaddy.domain}</strong></li>
          <li>Modo build: <strong>{data.godaddy.outputMode}</strong></li>
          <li>Node: <strong>{data.godaddy.nodeVersion}</strong></li>
          <li>Ejecutar: <code className="rounded bg-cream px-2 py-0.5">npm run godaddy:prep</code></li>
          <li>Verificar: <code className="rounded bg-cream px-2 py-0.5">npm run health-check</code></li>
        </ul>
      </div>
    </div>
  );
}

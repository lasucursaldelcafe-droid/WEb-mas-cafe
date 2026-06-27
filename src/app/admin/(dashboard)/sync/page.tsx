"use client";

import { useEffect, useState } from "react";
import type { SyncLog } from "@/lib/types";

export default function AdminSyncPage() {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [apiUrl, setApiUrl] = useState("");

  useEffect(() => {
    setApiUrl(`${window.location.origin}/api/sync`);
    void fetch("/api/sync?action=logs")
      .then((r) => r.json())
      .then((d: SyncLog[]) => setLogs(d))
      .catch(() => setLogs([]));
  }, []);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-4xl text-blue-deep">Google Sync</h1>
        <p className="mt-2 text-charcoal/60">
          Sincronización con Google Drive vía Apps Script
        </p>
      </div>

      <div className="rounded-[1.5rem_2.5rem_1.5rem_2.5rem] border border-blue-deep/8 bg-white p-8 space-y-6">
        <h2 className="font-display text-xl text-blue-deep">Configuración</h2>
        <div className="space-y-3 text-sm">
          <p>
            <strong>1.</strong> Crea un proyecto en{" "}
            <a
              href="https://script.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-deep underline"
            >
              Google Apps Script
            </a>
          </p>
          <p>
            <strong>2.</strong> Copia el código de{" "}
            <code className="rounded bg-cream px-2">scripts/google-apps-script/Code.gs</code>
          </p>
          <p>
            <strong>3.</strong> Configura las propiedades del script:
          </p>
          <ul className="ml-6 list-disc space-y-1 font-mono text-xs text-charcoal/70">
            <li>API_URL = {apiUrl || "https://tu-dominio.com/api/sync"}</li>
            <li>APPS_SCRIPT_SECRET = (mismo valor que .env)</li>
            <li>DRIVE_FOLDER_ID = 153OUmu9lChpCk2NiiirUwI_Z5EDQQNtC</li>
          </ul>
          <p>
            <strong>4.</strong> Ejecuta <code className="rounded bg-cream px-2">testConnection</code>{" "}
            y programa un trigger diario con <code className="rounded bg-cream px-2">syncFromDrive</code>
          </p>
        </div>
      </div>

      <div className="rounded-[1.5rem_2.5rem_1.5rem_2.5rem] border border-blue-deep/8 bg-white p-8">
        <h2 className="font-display text-xl text-blue-deep">Firebase / Firestore</h2>
        <p className="mt-4 text-sm text-charcoal/70">
          Configura las variables en <code>.env.local</code> para activar Firestore como
          backend principal. Mientras tanto, el sitio usa JSON local como respaldo.
        </p>
        <ul className="mt-4 space-y-1 font-mono text-xs text-charcoal/60">
          <li>FIREBASE_PROJECT_ID</li>
          <li>FIREBASE_CLIENT_EMAIL</li>
          <li>FIREBASE_PRIVATE_KEY</li>
          <li>NEXT_PUBLIC_FIREBASE_*</li>
        </ul>
      </div>

      <div className="rounded-[1.5rem_2.5rem_1.5rem_2.5rem] border border-blue-deep/8 bg-white p-8">
        <h2 className="font-display text-xl text-blue-deep">Historial de sync</h2>
        <ul className="mt-6 space-y-3">
          {logs.length === 0 ? (
            <li className="text-sm text-charcoal/50">Sin registros</li>
          ) : (
            logs.map((log) => (
              <li key={log.id} className="text-sm border-b border-blue-deep/5 pb-3">
                <span className={log.status === "success" ? "text-green" : "text-cherry"}>
                  [{log.status}]
                </span>{" "}
                {log.message}
                <span className="ml-2 text-xs text-charcoal/40">
                  {new Date(log.timestamp).toLocaleString("es-CO")}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

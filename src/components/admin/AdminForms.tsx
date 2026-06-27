"use client";

import { useState } from "react";
import type { SiteContent } from "@/lib/types";

export function useAdminContent(initial: SiteContent) {
  const [content, setContent] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save(updated: SiteContent) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setContent(updated);
      setMessage("Cambios guardados");
    } catch {
      setMessage("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return { content, setContent, save, saving, message };
}

export function SaveBar({
  saving,
  message,
  onSave,
}: {
  saving: boolean;
  message: string | null;
  onSave: () => void;
}) {
  return (
    <div className="sticky bottom-6 z-20 flex items-center justify-between gap-4 rounded-2xl border border-blue-deep/10 bg-cream/95 px-6 py-4 shadow-lg backdrop-blur">
      <p className={`text-sm ${message?.includes("Error") ? "text-cherry" : "text-green"}`}>
        {saving ? "Guardando..." : message ?? "Recuerda guardar los cambios"}
      </p>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="rounded-full bg-blue-deep px-8 py-3 text-sm font-bold text-cream disabled:opacity-50"
      >
        Guardar cambios
      </button>
    </div>
  );
}

export function AdminField({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const className =
    "w-full rounded-xl border border-blue-deep/10 bg-white px-4 py-3 text-sm outline-none focus:border-blue-deep";

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-charcoal/80">{label}</span>
      {multiline ? (
        <textarea
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
        />
      )}
    </label>
  );
}

export function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="rounded-[1.5rem_2.5rem_1.5rem_2.5rem] border border-blue-deep/8 bg-white p-6 organic-shadow">
      <p className="text-xs uppercase tracking-wider text-charcoal/50">
        {label}
      </p>
      <p className={`mt-2 font-display text-4xl ${accent ?? "text-blue-deep"}`}>
        {value}
      </p>
    </div>
  );
}

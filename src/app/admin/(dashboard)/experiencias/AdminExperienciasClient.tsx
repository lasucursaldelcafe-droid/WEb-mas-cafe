"use client";

import { AdminField, SaveBar, useAdminContent } from "@/components/admin/AdminForms";
import type { Experience, SiteContent } from "@/lib/types";

export default function AdminExperienciasClient({ initial }: { initial: SiteContent }) {
  const { content, setContent, save, saving, message } = useAdminContent(initial);

  function update(index: number, field: keyof Experience, value: string) {
    const experiences = [...content.experiences];
    experiences[index] = { ...experiences[index], [field]: value };
    setContent({ ...content, experiences });
  }

  return (
    <div className="space-y-8 pb-24">
      <h1 className="font-display text-4xl text-blue-deep">Experiencias</h1>
      {content.experiences.map((exp, index) => (
        <div key={exp.id} className="space-y-4 rounded-[1.5rem_2.5rem_1.5rem_2.5rem] border border-blue-deep/8 bg-white p-8">
          <h2 className="font-display text-2xl text-blue-deep">{exp.title}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField label="Título" value={exp.title} onChange={(v) => update(index, "title", v)} />
            <AdminField label="Subtítulo" value={exp.subtitle} onChange={(v) => update(index, "subtitle", v)} />
            <AdminField label="Imagen" value={exp.image} onChange={(v) => update(index, "image", v)} />
            <label className="block space-y-2">
              <span className="text-sm font-medium">Layout</span>
              <select
                value={exp.layout}
                onChange={(e) => update(index, "layout", e.target.value)}
                className="w-full rounded-xl border border-blue-deep/10 px-4 py-3 text-sm"
              >
                <option value="left">Izquierda</option>
                <option value="right">Derecha</option>
              </select>
            </label>
          </div>
          <AdminField label="Descripción" value={exp.description} onChange={(v) => update(index, "description", v)} multiline />
        </div>
      ))}
      <SaveBar saving={saving} message={message} onSave={() => void save(content)} />
    </div>
  );
}

"use client";

import { AdminField, SaveBar, useAdminContent } from "@/components/admin/AdminForms";
import type { SiteContent } from "@/lib/types";

export default function AdminConfigClient({ initial }: { initial: SiteContent }) {
  const { content, setContent, save, saving, message } = useAdminContent(initial);
  const { brand } = content;

  function updateBrand(field: keyof typeof brand, value: string) {
    setContent({ ...content, brand: { ...brand, [field]: value } });
  }

  return (
    <div className="space-y-8 pb-24">
      <h1 className="font-display text-4xl text-blue-deep">Configuración</h1>
      <div className="space-y-4 rounded-[1.5rem_2.5rem_1.5rem_2.5rem] border border-blue-deep/8 bg-white p-8">
        <h2 className="font-display text-2xl text-blue-deep">Marca</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="Tagline" value={brand.tagline} onChange={(v) => updateBrand("tagline", v)} />
          <AdminField label="Descriptor" value={brand.descriptor} onChange={(v) => updateBrand("descriptor", v)} />
          <AdminField label="Headline" value={brand.headline} onChange={(v) => updateBrand("headline", v)} />
          <AdminField label="Subheadline" value={brand.subheadline} onChange={(v) => updateBrand("subheadline", v)} />
        </div>
        <AdminField label="Propósito" value={brand.purpose} onChange={(v) => updateBrand("purpose", v)} multiline />
        <AdminField label="Misión" value={brand.mission} onChange={(v) => updateBrand("mission", v)} multiline />
      </div>
      <div className="space-y-4 rounded-[1.5rem_2.5rem_1.5rem_2.5rem] border border-blue-deep/8 bg-white p-8">
        <h2 className="font-display text-2xl text-blue-deep">Contacto</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="Teléfono" value={brand.phone} onChange={(v) => updateBrand("phone", v)} />
          <AdminField label="Email" value={brand.email} onChange={(v) => updateBrand("email", v)} />
          <AdminField label="Dirección" value={brand.address} onChange={(v) => updateBrand("address", v)} />
          <AdminField label="Ciudad" value={brand.city} onChange={(v) => updateBrand("city", v)} />
          <AdminField label="Horarios" value={brand.hours} onChange={(v) => updateBrand("hours", v)} />
          <AdminField label="WhatsApp (sin +)" value={brand.whatsapp} onChange={(v) => updateBrand("whatsapp", v)} />
        </div>
      </div>
      <SaveBar saving={saving} message={message} onSave={() => void save(content)} />
    </div>
  );
}

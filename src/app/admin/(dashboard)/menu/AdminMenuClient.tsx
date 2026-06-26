"use client";

import { AdminField, SaveBar, useAdminContent } from "@/components/admin/AdminForms";
import type { MenuCategory, SiteContent } from "@/lib/types";

export default function AdminMenuClient({ initial }: { initial: SiteContent }) {
  const { content, setContent, save, saving, message } = useAdminContent(initial);

  function updateCategory(catIndex: number, name: string) {
    const menu = [...content.menu];
    menu[catIndex] = { ...menu[catIndex], name };
    setContent({ ...content, menu });
  }

  function updateItem(
    catIndex: number,
    itemIndex: number,
    field: "name" | "description" | "price",
    value: string,
  ) {
    const menu = [...content.menu];
    const items = [...menu[catIndex].items];
    const item = { ...items[itemIndex] };
    if (field === "price") item.price = Number(value) || 0;
    else if (field === "description") item.description = value;
    else item.name = value;
    items[itemIndex] = item;
    menu[catIndex] = { ...menu[catIndex], items };
    setContent({ ...content, menu });
  }

  function addItem(catIndex: number) {
    const menu = [...content.menu];
    menu[catIndex] = {
      ...menu[catIndex],
      items: [...menu[catIndex].items, { name: "Nuevo ítem", price: 0 }],
    };
    setContent({ ...content, menu });
  }

  return (
    <div className="space-y-8 pb-24">
      <h1 className="font-display text-4xl text-blue-deep">Menú</h1>
      {content.menu.map((category: MenuCategory, catIndex) => (
        <div key={category.id} className="rounded-[1.5rem_2.5rem_1.5rem_2.5rem] border border-blue-deep/8 bg-white p-8">
          <AdminField
            label="Categoría"
            value={category.name}
            onChange={(v) => updateCategory(catIndex, v)}
          />
          <div className="mt-6 space-y-4">
            {category.items.map((item, itemIndex) => (
              <div key={`${item.name}-${itemIndex}`} className="grid gap-3 border-t border-blue-deep/5 pt-4 md:grid-cols-3">
                <AdminField label="Nombre" value={item.name} onChange={(v) => updateItem(catIndex, itemIndex, "name", v)} />
                <AdminField label="Descripción" value={item.description ?? ""} onChange={(v) => updateItem(catIndex, itemIndex, "description", v)} />
                <AdminField label="Precio" value={String(item.price)} onChange={(v) => updateItem(catIndex, itemIndex, "price", v)} />
              </div>
            ))}
          </div>
          <button type="button" onClick={() => addItem(catIndex)} className="mt-4 text-sm text-blue-deep hover:underline">
            + Agregar ítem
          </button>
        </div>
      ))}
      <SaveBar saving={saving} message={message} onSave={() => void save(content)} />
    </div>
  );
}

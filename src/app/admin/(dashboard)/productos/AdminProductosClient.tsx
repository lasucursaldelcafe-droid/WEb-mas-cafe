"use client";

import { AdminField, SaveBar, useAdminContent } from "@/components/admin/AdminForms";
import type { Product, SiteContent } from "@/lib/types";

export default function AdminProductosPage({
  initial,
}: {
  initial: SiteContent;
}) {
  const { content, setContent, save, saving, message } = useAdminContent(initial);

  function updateProduct(index: number, field: keyof Product, value: string | number | boolean | string[]) {
    const products = [...content.products];
    products[index] = { ...products[index], [field]: value };
    setContent({ ...content, products });
  }

  function addProduct() {
    const newProduct: Product = {
      id: `producto-${Date.now()}`,
      name: "Nuevo café",
      variety: "Variedad",
      origin: "Colombia",
      region: "Colombia",
      price: 45000,
      weight: "250 g",
      roast: "Tostión media",
      grind: "Grano",
      notes: ["Nota"],
      image: "/images/products/caja-cafe.png",
      subscription: false,
      featured: false,
    };
    setContent({ ...content, products: [...content.products, newProduct] });
  }

  function removeProduct(index: number) {
    setContent({
      ...content,
      products: content.products.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="space-y-8 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl text-blue-deep">Productos</h1>
        <button
          type="button"
          onClick={addProduct}
          className="rounded-full bg-sage px-6 py-2.5 text-sm font-bold text-blue-deep"
        >
          + Agregar
        </button>
      </div>

      <div className="space-y-8">
        {content.products.map((product, index) => (
          <div
            key={product.id}
            className="space-y-4 rounded-[1.5rem_2.5rem_1.5rem_2.5rem] border border-blue-deep/8 bg-white p-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-blue-deep">{product.name}</h2>
              <button
                type="button"
                onClick={() => removeProduct(index)}
                className="text-sm text-cherry hover:underline"
              >
                Eliminar
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label="Nombre" value={product.name} onChange={(v) => updateProduct(index, "name", v)} />
              <AdminField label="Variedad" value={product.variety} onChange={(v) => updateProduct(index, "variety", v)} />
              <AdminField label="Origen" value={product.origin} onChange={(v) => updateProduct(index, "origin", v)} />
              <AdminField label="Región" value={product.region} onChange={(v) => updateProduct(index, "region", v)} />
              <AdminField label="Precio (COP)" value={String(product.price)} onChange={(v) => updateProduct(index, "price", Number(v) || 0)} />
              <AdminField label="Peso" value={product.weight} onChange={(v) => updateProduct(index, "weight", v)} />
              <AdminField label="Notas (separadas por coma)" value={product.notes.join(", ")} onChange={(v) => updateProduct(index, "notes", v.split(",").map((s) => s.trim()))} />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={product.featured}
                  onChange={(e) => updateProduct(index, "featured", e.target.checked)}
                />
                Destacado
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={product.subscription}
                  onChange={(e) => updateProduct(index, "subscription", e.target.checked)}
                />
                Suscripción
              </label>
            </div>
          </div>
        ))}
      </div>

      <SaveBar saving={saving} message={message} onSave={() => void save(content)} />
    </div>
  );
}

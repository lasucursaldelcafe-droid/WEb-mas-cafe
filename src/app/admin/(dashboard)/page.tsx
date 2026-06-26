import Link from "next/link";
import { StatCard } from "@/components/admin/AdminForms";
import { getContent } from "@/lib/store";

export default async function AdminDashboard() {
  const content = await getContent();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-4xl text-blue-deep">Dashboard</h1>
        <p className="mt-2 text-charcoal/60">
          Gestiona el contenido de Más Café
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Productos" value={content.products.length} />
        <StatCard label="Artículos blog" value={content.blog.length} accent="text-green" />
        <StatCard label="Categorías menú" value={content.menu.length} accent="text-brown-light" />
        <StatCard label="Experiencias" value={content.experiences.length} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/admin/productos", label: "Gestionar productos", desc: "Cafés, precios y orígenes" },
          { href: "/admin/menu", label: "Editar menú", desc: "Café, brunch y repostería" },
          { href: "/admin/blog", label: "Publicar artículos", desc: "Blog y contenido" },
          { href: "/admin/experiencias", label: "Experiencias", desc: "Secciones de la home" },
          { href: "/admin/configuracion", label: "Configuración", desc: "Marca, contacto y redes" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-[1.5rem_2.5rem_1.5rem_2.5rem] border border-blue-deep/8 bg-white p-6 transition hover:border-blue-deep/20 hover:shadow-md"
          >
            <h2 className="font-display text-xl text-blue-deep">{item.label}</h2>
            <p className="mt-2 text-sm text-charcoal/60">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard", icon: "◉" },
  { href: "/admin/analytics", label: "Analytics", icon: "◈" },
  { href: "/admin/productos", label: "Productos", icon: "☕" },
  { href: "/admin/menu", label: "Menú", icon: "☰" },
  { href: "/admin/blog", label: "Blog", icon: "✎" },
  { href: "/admin/experiencias", label: "Experiencias", icon: "✦" },
  { href: "/admin/sync", label: "Google Sync", icon: "↻" },
  { href: "/admin/sistema", label: "Sistema", icon: "⬡" },
  { href: "/admin/configuracion", label: "Configuración", icon: "⚙" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-blue-deep/10 bg-blue-deep p-6 text-cream lg:flex">
        <Link href="/admin" className="mb-10 block">
          <Image
            src="/images/brand/horizontal-crema.png"
            alt="Más Café Admin"
            width={150}
            height={45}
            className="h-10 w-auto"
          />
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {links.map((link) => {
            const active =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                  active
                    ? "bg-sage/20 font-medium text-sage"
                    : "text-cream/70 hover:bg-cream/10 hover:text-cream"
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-2 border-t border-cream/10 pt-6">
          <Link
            href="/"
            target="_blank"
            className="block rounded-2xl px-4 py-2 text-sm text-cream/60 hover:text-cream"
          >
            Ver sitio →
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="w-full rounded-2xl px-4 py-2 text-left text-sm text-cream/60 hover:text-cherry"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-blue-deep/8 bg-cream/80 px-6 py-4 backdrop-blur lg:px-10">
          <div className="lg:hidden">
            <Image
              src="/images/brand/logotype-azul.png"
              alt="Admin"
              width={40}
              height={40}
            />
          </div>
          <p className="text-sm text-charcoal/60">Panel de administración</p>
          <button
            type="button"
            onClick={() => void logout()}
            className="text-sm text-charcoal/60 hover:text-cherry lg:hidden"
          >
            Salir
          </button>
        </header>
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}

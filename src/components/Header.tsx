"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/cafe", label: "Café" },
  { href: "/menu", label: "Menú" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/tienda", label: "Tienda" },
  { href: "/blog", label: "Blog" },
  { href: "/contacto", label: "Contacto" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-blue-deep/10 bg-cream/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/brand/horizontal-azul.png"
            alt="Más Café"
            width={160}
            height={48}
            className="h-10 w-auto md:h-12"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-charcoal/80 transition hover:text-blue-deep"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/tienda"
            className="rounded-full bg-blue-deep px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-blue-mid"
          >
            Comprar café
          </Link>
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-deep/20 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          <span className="text-xl text-blue-deep">{open ? "×" : "☰"}</span>
        </button>
      </div>

      {open && (
        <nav className="border-t border-blue-deep/10 bg-cream px-6 py-4 lg:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-medium text-charcoal"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/tienda"
              className="rounded-full bg-blue-deep px-5 py-3 text-center text-sm font-medium text-cream"
              onClick={() => setOpen(false)}
            >
              Comprar café
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

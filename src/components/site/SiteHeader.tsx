"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { assetPath } from "@/lib/paths";

const navLinks = [
  { href: "/cafe", label: "Café" },
  { href: "/menu", label: "Menú" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/tienda", label: "Tienda" },
  { href: "/blog", label: "Blog" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[100] transition-all duration-500 ${
        scrolled
          ? "border-b border-blue-deep/10 bg-cream/90 py-3 backdrop-blur-xl"
          : "bg-transparent py-6"
      }`}
    >
      <div className="relative z-[110] mx-auto flex max-w-[1400px] items-center justify-between px-6 md:px-12">
        <Link href="/" className="relative z-10" onClick={() => setOpen(false)}>
          <Image
            src={
              scrolled
                ? assetPath("/images/brand/horizontal-azul.png")
                : assetPath("/images/brand/horizontal-crema.png")
            }
            alt="Más Café"
            width={170}
            height={50}
            className="h-9 w-auto transition-opacity md:h-11"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-10 xl:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative z-10 text-sm font-medium transition ${
                scrolled
                  ? "text-charcoal/80 hover:text-blue-deep"
                  : "text-cream/90 hover:text-sage"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/tienda"
            className={`relative z-10 rounded-full px-6 py-2.5 text-sm font-bold transition ${
              scrolled
                ? "bg-blue-deep text-cream hover:bg-blue-mid"
                : "bg-sage text-blue-deep hover:bg-cream"
            }`}
          >
            Comprar café
          </Link>
        </nav>

        <button
          type="button"
          className={`relative z-[120] flex h-11 w-11 items-center justify-center rounded-full border xl:hidden ${
            scrolled
              ? "border-blue-deep/20 text-blue-deep"
              : "border-cream/30 text-cream"
          }`}
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          {open ? "×" : "☰"}
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[105] bg-blue-deep/95 backdrop-blur-sm xl:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
        >
          <nav className="flex h-full flex-col items-center justify-center gap-8 px-6 pt-20">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-display text-3xl text-cream transition hover:text-sage"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/tienda"
              className="mt-4 rounded-full bg-sage px-8 py-4 font-bold text-blue-deep"
              onClick={() => setOpen(false)}
            >
              Comprar café
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

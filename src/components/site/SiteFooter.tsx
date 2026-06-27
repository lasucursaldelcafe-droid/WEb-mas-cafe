import Image from "next/image";
import Link from "next/link";
import { assetPath } from "@/lib/paths";
import type { Brand } from "@/lib/types";

export function SiteFooter({ brand }: { brand: Brand }) {
  return (
    <footer className="relative overflow-hidden bg-blue-deep text-cream">
      <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-green/10 blur-3xl" />
      <div className="absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-sage/10 blur-3xl" />

      <div className="relative mx-auto max-w-[1400px] px-6 py-24 md:px-12">
        <div className="flex flex-col gap-16 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-md space-y-6">
            <Image
              src={assetPath("/images/brand/horizontal-crema.png")}
              alt="Más Café"
              width={200}
              height={60}
              className="h-14 w-auto"
            />
            <p className="font-accent text-4xl text-sage md:text-5xl">
              {brand.tagline}
            </p>
            <p className="text-cream/60">{brand.descriptor}</p>
          </div>

          <div className="flex flex-wrap gap-16 text-sm">
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.2em] text-sage">
                Explora
              </p>
              <ul className="space-y-2 text-cream/75">
                <li>
                  <Link href="/cafe" className="hover:text-sage">
                    Café
                  </Link>
                </li>
                <li>
                  <Link href="/menu" className="hover:text-sage">
                    Menú
                  </Link>
                </li>
                <li>
                  <Link href="/tienda" className="hover:text-sage">
                    Tienda
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-sage">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.2em] text-sage">
                Visítanos
              </p>
              <address className="space-y-1 not-italic text-cream/75">
                <p>{brand.address}</p>
                <p>{brand.city}</p>
                <a href={`tel:${brand.phone}`} className="hover:text-sage">
                  {brand.phone}
                </a>
              </address>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-start justify-between gap-4 border-t border-cream/10 pt-8 text-xs text-cream/40 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} {brand.name}</p>
          <div className="flex gap-8">
            <a
              href={brand.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cream/70"
            >
              Instagram
            </a>
            <Link href="/contacto" className="hover:text-cream/70">
              Contacto
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

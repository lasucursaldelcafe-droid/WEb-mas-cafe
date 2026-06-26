import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/data";

export function Footer() {
  return (
    <footer className="bg-blue-deep text-cream">
      <div className="section-padding mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Image
              src="/images/brand/horizontal-crema.png"
              alt="Más Café"
              width={180}
              height={54}
              className="h-12 w-auto"
            />
            <p className="font-accent text-2xl text-sage">{brand.tagline}</p>
            <p className="text-sm text-cream/70">{brand.descriptor}</p>
          </div>

          <div>
            <h3 className="mb-4 font-display text-lg">Explora</h3>
            <ul className="space-y-2 text-sm text-cream/80">
              <li>
                <Link href="/cafe" className="hover:text-sage">
                  Nuestro café
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-sage">
                  Menú
                </Link>
              </li>
              <li>
                <Link href="/tienda" className="hover:text-sage">
                  Tienda online
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
            <h3 className="mb-4 font-display text-lg">Visítanos</h3>
            <address className="space-y-2 text-sm not-italic text-cream/80">
              <p>{brand.address}</p>
              <p>{brand.city}</p>
              <p>
                <a href={`tel:${brand.phone}`} className="hover:text-sage">
                  {brand.phone}
                </a>
              </p>
            </address>
          </div>

          <div>
            <h3 className="mb-4 font-display text-lg">Síguenos</h3>
            <ul className="space-y-2 text-sm text-cream/80">
              <li>
                <a
                  href={brand.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sage"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={brand.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sage"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a href={`mailto:${brand.email}`} className="hover:text-sage">
                  {brand.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-cream/10 pt-8 text-xs text-cream/50 md:flex-row">
          <p>© {new Date().getFullYear()} Más Café. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="/contacto" className="hover:text-cream/80">
              Política de datos
            </Link>
            <Link href="/contacto" className="hover:text-cream/80">
              Términos y condiciones
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

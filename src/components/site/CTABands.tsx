import Link from "next/link";
import type { Brand } from "@/lib/types";
import { getMapsUrl } from "@/lib/maps";

export function SubscriptionBand({ brand }: { brand: Brand }) {
  return (
    <section className="relative overflow-hidden bg-sage/40 py-24 md:py-28">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="relative overflow-hidden rounded-[3rem] bg-blue-deep px-8 py-20 text-cream md:px-20 md:py-24">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-green/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <p className="font-accent text-4xl text-sage md:text-5xl">
              Café en casa
            </p>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">
              Suscripción mensual
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-cream/75">
              Recibe café fresco tostado cada mes con guías de preparación.
              Microlotes con trazabilidad completa, directo a tu puerta.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/tienda"
                className="rounded-full bg-sage px-10 py-4 text-sm font-bold text-blue-deep hover:bg-cream"
              >
                Suscribirme
              </Link>
              <a
                href={`https://wa.me/${brand.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-cream/25 px-10 py-4 text-sm font-medium hover:bg-cream/10"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function VisitBand({ brand }: { brand: Brand }) {
  return (
    <section className="relative overflow-hidden bg-blue-deep py-28 text-cream">
      <div className="mx-auto max-w-[1400px] px-6 text-center md:px-12">
        <p className="font-accent text-4xl text-sage md:text-5xl">Te esperamos</p>
        <h2 className="mt-6 font-display text-5xl md:text-6xl">Visítanos en Cali</h2>
        <a
          href={getMapsUrl(brand)}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto mt-6 block max-w-lg text-cream/70 transition-colors hover:text-sage hover:underline hover:underline-offset-4"
        >
          {brand.address}
          <br />
          {brand.city}
        </a>
        <p className="mt-3 text-sm text-cream/50">{brand.hours}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href={getMapsUrl(brand)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-sage px-10 py-4 text-sm font-bold text-blue-deep"
          >
            Cómo llegar
          </a>
          <Link
            href="/contacto"
            className="rounded-full border border-cream/25 px-10 py-4 text-sm font-medium hover:bg-cream/10"
          >
            Contacto
          </Link>
        </div>
      </div>
    </section>
  );
}

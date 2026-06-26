import Link from "next/link";
import { brand } from "@/lib/data";

export function SubscriptionCTA() {
  return (
    <section className="relative overflow-hidden bg-sage/40">
      <div className="section-padding relative mx-auto max-w-7xl">
        <div className="rounded-3xl bg-blue-deep px-8 py-16 text-center text-cream md:px-16">
          <p className="font-accent text-3xl text-sage md:text-4xl">
            Café en casa
          </p>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">
            Suscripción mensual
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-cream/80">
            Recibe café fresco tostado cada mes. Seleccionamos microlotes con
            trazabilidad completa y te acompañamos con guías de preparación para
            que disfrutes la pausa en casa.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/tienda"
              className="rounded-full bg-cream px-8 py-4 text-sm font-bold text-blue-deep transition hover:bg-sage"
            >
              Suscribirme
            </Link>
            <a
              href={`https://wa.me/${brand.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-cream/30 px-8 py-4 text-sm font-medium transition hover:bg-cream/10"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function VisitCTA() {
  return (
    <section className="section-padding mx-auto max-w-7xl text-center">
      <p className="font-accent text-3xl text-brown-light md:text-4xl">
        Te esperamos
      </p>
      <h2 className="mt-4 font-display text-4xl text-blue-deep md:text-5xl">
        Visítanos en Cali
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-charcoal/70">
        {brand.address}, {brand.city}
      </p>
      <p className="mt-2 text-sm text-charcoal/60">
        Lunes a sábado 7:30am – 8:00pm · Domingos y festivos 9:00am – 7:00pm
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(`${brand.address}, ${brand.city}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-blue-deep px-8 py-4 text-sm font-medium text-cream transition hover:bg-blue-mid"
        >
          Cómo llegar
        </a>
        <Link
          href="/contacto"
          className="rounded-full border border-blue-deep px-8 py-4 text-sm font-medium text-blue-deep transition hover:bg-blue-deep hover:text-cream"
        >
          Contacto
        </Link>
      </div>
    </section>
  );
}

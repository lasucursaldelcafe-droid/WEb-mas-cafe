import { VisitCTA } from "@/components/CTASections";
import { brand } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Visítanos en Cali o escríbenos. Más Café — pausa con intención.",
};

export default function ContactoPage() {
  return (
    <>
      <section className="bg-blue-deep py-24 text-cream md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <p className="font-accent text-3xl text-sage">Contacto</p>
          <h1 className="mt-4 font-display text-5xl md:text-6xl">
            Hablemos
          </h1>
        </div>
      </section>

      <section className="section-padding mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-2xl text-blue-deep">
                Visítanos
              </h2>
              <address className="mt-4 space-y-1 not-italic text-charcoal/80">
                <p>{brand.address}</p>
                <p>{brand.city}</p>
              </address>
            </div>

            <div>
              <h2 className="font-display text-2xl text-blue-deep">
                Escríbenos
              </h2>
              <ul className="mt-4 space-y-2 text-charcoal/80">
                <li>
                  <a
                    href={`tel:${brand.phone}`}
                    className="hover:text-blue-deep"
                  >
                    {brand.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${brand.email}`}
                    className="hover:text-blue-deep"
                  >
                    {brand.email}
                  </a>
                </li>
                <li>
                  <a
                    href={`https://wa.me/${brand.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-deep"
                  >
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl text-blue-deep">
                Redes sociales
              </h2>
              <ul className="mt-4 space-y-2 text-charcoal/80">
                <li>
                  <a
                    href={brand.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-deep"
                  >
                    Instagram @mascafecol315
                  </a>
                </li>
                <li>
                  <a
                    href={brand.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-deep"
                  >
                    Facebook
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <form className="space-y-6 rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="font-display text-2xl text-blue-deep">
              Envíanos un mensaje
            </h2>
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Nombre
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="w-full rounded-xl border border-charcoal/10 bg-cream px-4 py-3 text-sm outline-none focus:border-blue-deep"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="w-full rounded-xl border border-charcoal/10 bg-cream px-4 py-3 text-sm outline-none focus:border-blue-deep"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-medium"
              >
                Mensaje
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className="w-full resize-none rounded-xl border border-charcoal/10 bg-cream px-4 py-3 text-sm outline-none focus:border-blue-deep"
                placeholder="¿En qué podemos ayudarte?"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-blue-deep py-4 text-sm font-medium text-cream transition hover:bg-blue-mid"
            >
              Enviar mensaje
            </button>
          </form>
        </div>
      </section>

      <VisitCTA />
    </>
  );
}

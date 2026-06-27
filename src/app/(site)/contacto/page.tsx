import { VisitBand } from "@/components/site/CTABands";
import { getContent } from "@/lib/store";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
};

export default async function ContactoPage() {
  const { brand } = await getContent();

  return (
    <>
      <section className="bg-blue-deep pt-32 pb-16 text-cream">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <p className="font-accent text-4xl text-sage">Contacto</p>
          <h1 className="mt-2 font-display text-5xl md:text-6xl">Hablemos</h1>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-20 md:px-12">
        <div className="flex flex-col gap-16 lg:flex-row">
          <div className="space-y-10 lg:w-1/2">
            <div>
              <h2 className="font-display text-2xl text-blue-deep">Visítanos</h2>
              <address className="mt-4 space-y-1 not-italic text-charcoal/75">
                <p>{brand.address}</p>
                <p>{brand.city}</p>
                <p className="text-sm text-charcoal/50">{brand.hours}</p>
              </address>
            </div>
            <div>
              <h2 className="font-display text-2xl text-blue-deep">Escríbenos</h2>
              <ul className="mt-4 space-y-2 text-charcoal/75">
                <li>
                  <a href={`tel:${brand.phone}`}>{brand.phone}</a>
                </li>
                <li>
                  <a href={`mailto:${brand.email}`}>{brand.email}</a>
                </li>
                <li>
                  <a
                    href={`https://wa.me/${brand.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <form className="flex-1 space-y-5 rounded-[2rem_4rem_2rem_4rem] bg-white p-10 organic-shadow">
            <h2 className="font-display text-2xl text-blue-deep">
              Envíanos un mensaje
            </h2>
            {["Nombre", "Email", "Mensaje"].map((label, i) =>
              i < 2 ? (
                <input
                  key={label}
                  type={i === 1 ? "email" : "text"}
                  placeholder={label}
                  className="w-full rounded-xl border border-blue-deep/10 bg-cream px-4 py-3 text-sm outline-none focus:border-blue-deep"
                />
              ) : (
                <textarea
                  key={label}
                  rows={5}
                  placeholder={label}
                  className="w-full resize-none rounded-xl border border-blue-deep/10 bg-cream px-4 py-3 text-sm outline-none focus:border-blue-deep"
                />
              ),
            )}
            <button
              type="submit"
              className="w-full rounded-full bg-blue-deep py-4 text-sm font-bold text-cream"
            >
              Enviar
            </button>
          </form>
        </div>
      </section>

      <VisitBand brand={brand} />
    </>
  );
}

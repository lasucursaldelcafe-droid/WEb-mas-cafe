import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/data";

export function PurposeSection() {
  return (
    <section className="section-padding mx-auto max-w-7xl">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <Image
            src="/images/hero/fachada.png"
            alt="Fachada de Más Café"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div className="space-y-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-brown-light">
            Nuestro propósito
          </p>
          <h2 className="font-display text-4xl text-blue-deep md:text-5xl">
            Hospitalidad que va más allá del café
          </h2>
          <p className="text-lg leading-relaxed text-charcoal/80">
            {brand.purpose}
          </p>
          <p className="leading-relaxed text-charcoal/70">{brand.mission}</p>
          <Link
            href="/nosotros"
            className="inline-flex items-center gap-2 font-medium text-blue-deep hover:text-green"
          >
            Conoce más sobre nosotros
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ValuesSection() {
  return (
    <section className="bg-blue-deep text-cream">
      <div className="section-padding mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-sage">
            Valores de marca
          </p>
          <h2 className="font-display text-4xl md:text-5xl">
            Lo que nos guía cada día
          </h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          {brand.values.map((value) => (
            <div
              key={value.title}
              className="rounded-3xl border border-cream/10 bg-cream/5 p-8"
            >
              <h3 className="font-display text-2xl text-sage">{value.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-cream/80">
                {value.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import { PurposeSection, ValuesSection } from "@/components/PurposeSection";
import { brand } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Conoce la historia, propósito y valores de Más Café. Hospitalidad consciente en Cali.",
};

export default function NosotrosPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-blue-deep py-24 text-cream md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <p className="font-accent text-3xl text-sage">{brand.descriptor}</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl leading-tight md:text-6xl">
            Un espacio para pausar con intención
          </h1>
        </div>
      </section>

      <section className="section-padding mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6 text-lg leading-relaxed text-charcoal/80">
            <p>
              Toda historia tiene un comienzo. La nuestra comenzó con un café.
              Con una taza entre las manos y la certeza de que los mejores
              momentos merecen pausa.
            </p>
            <p>
              Desde entonces, cada grano que seleccionamos, tostamos y
              empacamos lleva esa misma intención: que cuando lo prepares,
              sientas que este momento — este, exactamente — vale la pena.
            </p>
            <p>{brand.vision}</p>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            <Image
              src="/images/brand/mood.png"
              alt="Ambiente Más Café"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <PurposeSection />
      <ValuesSection />

      <section className="section-padding mx-auto max-w-3xl text-center">
        <p className="font-accent text-4xl text-brown-light md:text-5xl">
          &ldquo;Necesito un lugar donde pueda pausar, trabajar tranquilo y
          sentirme bien atendido.&rdquo;
        </p>
        <p className="mt-6 text-sm uppercase tracking-[0.2em] text-charcoal/50">
          Nuestra comunidad
        </p>
      </section>
    </>
  );
}

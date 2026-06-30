import Image from "next/image";
import { StorySection, ValuesBand } from "@/components/site/StorySection";
import { BrandTitle } from "@/lib/brand-title";
import { assetPath } from "@/lib/paths";
import { getContent } from "@/lib/store";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nosotros",
};

export default async function NosotrosPage() {
  const { brand } = await getContent();

  return (
    <>
      <section className="relative min-h-[60vh] overflow-hidden bg-blue-deep pt-32 text-cream">
        <div className="absolute inset-0 opacity-20">
          <Image src={assetPath("/images/grafica/3.png")} alt="" fill className="object-cover" />
        </div>
        <div className="relative mx-auto max-w-[1400px] px-6 pb-20 md:px-12">
          <p className="font-accent text-4xl text-sage">{brand.descriptor}</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl md:text-7xl">
            <BrandTitle>Un espacio para pausar con intención</BrandTitle>
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-24 md:px-12">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
          <div className="space-y-6 text-lg leading-relaxed text-charcoal/80 lg:w-1/2">
            <p>
              Toda historia tiene un comienzo. La nuestra comenzó con un café.
              Con una taza entre las manos y la certeza de que los mejores
              momentos merecen pausa.
            </p>
            <p>{brand.vision}</p>
          </div>
          <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-[1rem_3rem_1rem_3rem]">
            <Image
              src={assetPath("/images/brand/mood.png")}
              alt="Ambiente Más Café"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <StorySection brand={brand} />
      <ValuesBand brand={brand} />

      <section className="py-24 text-center">
        <p className="mx-auto max-w-2xl font-accent text-3xl text-brown-light md:text-4xl">
          &ldquo;Necesito un lugar donde pueda pausar, trabajar tranquilo y
          sentirme bien atendido.&rdquo;
        </p>
      </section>
    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import { OrganicDecor } from "@/components/ui/OrganicDecor";
import { BrandTitle } from "@/lib/brand-title";
import { assetPath } from "@/lib/paths";
import type { Brand } from "@/lib/types";

export function StorySection({ brand }: { brand: Brand }) {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <OrganicDecor index={1} className="right-10 top-10 h-40 w-40" />

      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="relative">
          <div className="absolute -left-4 top-8 z-10 hidden font-accent text-[8rem] leading-none text-sage/40 md:block">
            +
          </div>

          <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
            <div className="relative lg:w-[55%]">
              <div className="relative aspect-[5/4] overflow-hidden rounded-[4rem_1.5rem_4rem_1.5rem] organic-shadow">
                <Image
                  src={assetPath("/images/aplicaciones/fachada2.png")}
                  alt="Fachada Más Café"
                  fill
                  className="object-cover"
                  sizes="55vw"
                />
              </div>
              <div className="absolute -bottom-8 -right-4 hidden h-48 w-48 overflow-hidden rounded-full border-8 border-cream md:block">
                <Image
                  src={assetPath("/images/grafica/2.png")}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="lg:w-[45%] lg:pl-8">
              <p className="text-sm uppercase tracking-[0.25em] text-brown-light">
                Nuestro propósito
              </p>
              <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.2rem)] leading-tight text-blue-deep">
                <BrandTitle>Hospitalidad que va más allá del café</BrandTitle>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-charcoal/80">
                {brand.purpose}
              </p>
              <p className="mt-4 leading-relaxed text-charcoal/65">
                {brand.mission}
              </p>
              <Link
                href="/nosotros"
                className="mt-8 inline-flex items-center gap-2 font-medium text-blue-deep hover:text-green"
              >
                Conoce más <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ValuesBand({ brand }: { brand: Brand }) {
  return (
    <section className="bg-sage/35 py-24">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <h2 className="mb-16 text-center font-display text-4xl text-blue-deep md:text-5xl">
          <BrandTitle>Lo que nos guía</BrandTitle>
        </h2>
        <div className="flex flex-col gap-px overflow-hidden rounded-[2rem] bg-blue-deep/10">
          {brand.values.map((value, i) => (
            <div
              key={value.title}
              className={`flex flex-col gap-4 p-8 md:flex-row md:items-center md:gap-12 md:p-12 ${
                i % 2 === 0 ? "bg-cream" : "bg-cream-dark/60"
              }`}
            >
              <span className="font-accent text-5xl text-brown-light md:w-32">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-2xl text-blue-deep md:text-3xl">
                  <BrandTitle>{value.title}</BrandTitle>
                </h3>
                <p className="mt-3 max-w-2xl leading-relaxed text-charcoal/70">
                  {value.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

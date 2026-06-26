import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/data";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-blue-deep text-cream">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -right-20 top-0 h-96 w-96 rounded-full bg-green blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-sage blur-3xl" />
      </div>

      <div className="section-padding relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-8">
          <p className="font-accent text-3xl text-sage md:text-4xl">
            {brand.tagline}
          </p>
          <h1 className="text-balance font-display text-5xl leading-tight md:text-6xl lg:text-7xl">
            {brand.headline}
          </h1>
          <p className="max-w-xl text-lg text-cream/80">{brand.subheadline}</p>
          <p className="text-sm uppercase tracking-[0.2em] text-cream/60">
            {brand.descriptor}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/tienda"
              className="rounded-full bg-cream px-8 py-4 text-sm font-bold text-blue-deep transition hover:bg-sage"
            >
              Comprar café fresco
            </Link>
            <Link
              href="/nosotros"
              className="rounded-full border border-cream/30 px-8 py-4 text-sm font-medium text-cream transition hover:bg-cream/10"
            >
              Conoce nuestra historia
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-sage/20">
            <Image
              src="/images/hero/illustration.png"
              alt="Persona disfrutando una taza de café en Más Café"
              fill
              className="object-contain p-6"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-cream p-4 shadow-xl md:block">
            <Image
              src="/images/brand/favs.png"
              alt="Símbolo Más Café"
              width={80}
              height={80}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { BrandTitle } from "@/lib/brand-title";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductRiver({ products }: { products: Product[] }) {
  const featured = products.filter((p) => p.featured);
  const display = featured.length > 0 ? featured : products;

  return (
    <section className="relative overflow-hidden bg-blue-deep py-24 text-cream md:py-32">
      <div className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-green/10 blur-3xl" />

      <div className="relative mx-auto mb-16 max-w-[1400px] px-6 md:px-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-sm uppercase tracking-[0.25em] text-sage">
              Café fresco
            </p>
            <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.5rem)] leading-tight">
              <BrandTitle>Calidad extraordinaria, trazabilidad al origen</BrandTitle>
            </h2>
          </div>
          <Link
            href="/tienda"
            className="shrink-0 self-start rounded-full border border-cream/25 px-8 py-3 text-sm font-medium transition hover:bg-cream/10"
          >
            Ver tienda →
          </Link>
        </div>
      </div>

      <div className="hide-scrollbar flex gap-8 overflow-x-auto px-6 pb-4 md:px-12">
        {display.map((product, i) => (
          <article
            key={product.id}
            className={`relative shrink-0 ${
              i % 2 === 0 ? "w-[min(85vw,420px)]" : "w-[min(85vw,380px)] mt-12"
            }`}
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem_4rem_2rem_4rem] bg-sage/10">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain p-8"
                sizes="420px"
              />
              {product.subscription && (
                <span className="absolute left-6 top-6 rounded-full bg-green px-4 py-1.5 text-xs font-bold">
                  Suscripción
                </span>
              )}
            </div>
            <div className="mt-6 space-y-2">
              <p className="text-xs uppercase tracking-wider text-sage/80">
                {product.variety} · {product.region}
              </p>
              <h3 className="font-display text-3xl">
                <BrandTitle>{product.name}</BrandTitle>
              </h3>
              {product.farm && (
                <p className="text-sm text-cream/60">
                  {product.farm} · {product.altitude}
                </p>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                {product.notes.map((note) => (
                  <span
                    key={note}
                    className="rounded-full bg-cream/10 px-3 py-1 text-xs"
                  >
                    {note}
                  </span>
                ))}
              </div>
              <p className="pt-2 text-2xl font-bold">
                {formatPrice(product.price)}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ProductDetailCard({ product }: { product: Product }) {
  return (
    <article className="group relative">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem_3rem_1.5rem_3rem] bg-sage/20 organic-shadow">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-6 transition duration-700 group-hover:scale-105"
        />
      </div>
      <div className="mt-6">
        <p className="text-xs uppercase tracking-wider text-brown-light">
          {product.variety} · {product.region}
        </p>
        <h3 className="mt-2 font-display text-3xl text-blue-deep">
          <BrandTitle>{product.name}</BrandTitle>
        </h3>
        <p className="mt-4 text-2xl font-bold text-blue-deep">
          {formatPrice(product.price)}
        </p>
      </div>
    </article>
  );
}

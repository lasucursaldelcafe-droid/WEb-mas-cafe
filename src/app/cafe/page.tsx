import Image from "next/image";
import { ProductCard } from "@/components/ProductShowcase";
import { SubscriptionCTA } from "@/components/CTASections";
import { products } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Café de especialidad",
  description:
    "Microlotes colombianos con trazabilidad completa. Café fresco tostado en Cali.",
};

export default function CafePage() {
  return (
    <>
      <section className="bg-blue-deep py-24 text-cream md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <p className="font-accent text-3xl text-sage">Café fresco</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl md:text-6xl">
            Calidad sensorial extraordinaria y trazabilidad al origen
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-cream/80">
            Seleccionamos microlotes de fincas aliadas en Colombia. Cada bolsa
            cuenta la historia de su productor, su territorio y su proceso.
          </p>
        </div>
      </section>

      <section className="section-padding mx-auto max-w-7xl">
        <div className="mb-16 grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-sage/30">
            <Image
              src="/images/products/caja-cafe.png"
              alt="Empaque de café Más Café"
              fill
              className="object-contain p-8"
            />
          </div>
          <div className="space-y-6">
            <h2 className="font-display text-4xl text-blue-deep">
              Prepáralo en casa, a tu manera
            </h2>
            <ol className="space-y-4 text-charcoal/80">
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-deep text-sm font-bold text-cream">
                  1
                </span>
                Calienta 320 ml de agua hasta que deje de hervir.
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-deep text-sm font-bold text-cream">
                  2
                </span>
                Usa 20 g de café (2 cucharadas colmadas aprox.).
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-deep text-sm font-bold text-cream">
                  3
                </span>
                Vierte el agua despacio, en círculos. Filtra en 3-4 minutos.
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-deep text-sm font-bold text-cream">
                  4
                </span>
                Sirve, comparte y disfruta. Ideal para goteo, prensa o pour over.
              </li>
            </ol>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <SubscriptionCTA />
    </>
  );
}

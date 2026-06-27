import Image from "next/image";
import { ProductDetailCard } from "@/components/site/ProductRiver";
import { SubscriptionBand } from "@/components/site/CTABands";
import { assetPath } from "@/lib/paths";
import { getContent } from "@/lib/store";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Café de especialidad",
};

export default async function CafePage() {
  const content = await getContent();
  const { products } = content;

  return (
    <>
      <section className="relative min-h-[70vh] overflow-hidden bg-blue-deep pt-32 text-cream">
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-30">
          <Image
            src={assetPath("/images/grafica/2.png")}
            alt=""
            fill
            className="object-contain object-right"
          />
        </div>
        <div className="relative mx-auto max-w-[1400px] px-6 pb-24 md:px-12">
          <p className="font-accent text-4xl text-sage">Café fresco</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-tight md:text-7xl">
            Calidad extraordinaria y trazabilidad al origen
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-24 md:px-12">
        <div className="mb-20 flex flex-col gap-12 lg:flex-row lg:items-center">
          <div className="relative aspect-square flex-1 overflow-hidden rounded-[3rem_1rem_3rem_1rem] bg-sage/20">
            <Image
              src={assetPath("/images/products/caja-cafe.png")}
              alt="Empaque Más Café"
              fill
              className="object-contain p-10"
            />
          </div>
          <div className="flex-1 space-y-6">
            <h2 className="font-display text-4xl text-blue-deep">
              Prepáralo en casa, a tu manera
            </h2>
            <ol className="space-y-5 text-charcoal/75">
              {[
                "Calienta 320 ml de agua hasta que deje de hervir.",
                "Usa 20 g de café (2 cucharadas colmadas aprox.).",
                "Vierte el agua despacio, en círculos. Filtra en 3-4 minutos.",
                "Sirve y disfruta. Ideal para goteo, prensa o pour over.",
              ].map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span className="font-accent text-3xl text-sage">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductDetailCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <SubscriptionBand brand={content.brand} />
    </>
  );
}

import { ProductDetailCard } from "@/components/site/ProductRiver";
import { SubscriptionBand } from "@/components/site/CTABands";
import { getContent } from "@/lib/store";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tienda online",
};

export default async function TiendaPage() {
  const content = await getContent();

  return (
    <>
      <section className="bg-blue-deep pt-32 pb-20 text-cream">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <p className="font-accent text-4xl text-sage">Tienda</p>
          <h1 className="mt-4 font-display text-5xl md:text-6xl">
            Café fresco, directo del origen
          </h1>
        </div>
      </section>
      <section className="mx-auto max-w-[1400px] px-6 py-20 md:px-12">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {content.products.map((product) => (
            <ProductDetailCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      <SubscriptionBand brand={content.brand} />
    </>
  );
}

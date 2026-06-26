import { ProductCard } from "@/components/ProductShowcase";
import { SubscriptionCTA } from "@/components/CTASections";
import { products } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tienda online",
  description: "Compra café fresco y recién tostado. Envíos en Colombia.",
};

export default function TiendaPage() {
  return (
    <>
      <section className="bg-blue-deep py-24 text-cream md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <p className="font-accent text-3xl text-sage">Tienda</p>
          <h1 className="mt-4 font-display text-5xl md:text-6xl">
            Café fresco, directo del origen
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-cream/80">
            Los cafés extraordinarios deben ser absolutamente frescos. Compra
            online o visítanos en Cali.
          </p>
        </div>
      </section>

      <section className="section-padding mx-auto max-w-7xl">
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

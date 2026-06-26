import Image from "next/image";
import Link from "next/link";
import { formatPrice, products } from "@/lib/data";

export function ProductCard({
  product,
}: {
  product: (typeof products)[number];
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-sage/30 p-6">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {product.subscription && (
          <span className="absolute left-4 top-4 rounded-full bg-green px-3 py-1 text-xs font-medium text-white">
            Suscripción
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-brown-light">
          {product.variety} · {product.region}
        </p>
        <h3 className="mt-1 font-display text-xl text-blue-deep">
          {product.name}
        </h3>
        {product.farm && (
          <p className="mt-1 text-sm text-charcoal/60">
            {product.farm} · {product.altitude}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {product.notes.map((note) => (
            <span
              key={note}
              className="rounded-full bg-cream px-3 py-1 text-xs text-charcoal/70"
            >
              {note}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-end justify-between pt-6">
          <div>
            <p className="font-bold text-blue-deep">
              {formatPrice(product.price)}
            </p>
            <p className="text-xs text-charcoal/50">{product.weight}</p>
          </div>
          <button
            type="button"
            className="rounded-full bg-blue-deep px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-blue-mid"
          >
            Comprar
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductShowcase({ limit = 4 }: { limit?: number }) {
  const items = products.slice(0, limit);

  return (
    <section className="bg-cream-dark/50">
      <div className="section-padding mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-brown-light">
              Café fresco
            </p>
            <h2 className="font-display text-4xl text-blue-deep md:text-5xl">
              Calidad extraordinaria, trazabilidad al origen
            </h2>
            <p className="mt-4 max-w-xl text-charcoal/70">
              Cada grano lo seleccionamos cuidadosamente. Tostión media, notas
              sensoriales únicas y pago justo al productor.
            </p>
          </div>
          <Link
            href="/tienda"
            className="shrink-0 rounded-full border border-blue-deep px-6 py-3 text-sm font-medium text-blue-deep transition hover:bg-blue-deep hover:text-cream"
          >
            Ver todos los cafés
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

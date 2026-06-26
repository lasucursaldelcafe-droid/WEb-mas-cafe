import { formatPrice, menuCategories } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menú",
  description: "Café de especialidad, desayunos, brunch y repostería en Más Café Cali.",
};

export default function MenuPage() {
  return (
    <>
      <section className="bg-blue-deep py-24 text-cream md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <p className="font-accent text-3xl text-sage">Menú</p>
          <h1 className="mt-4 font-display text-5xl md:text-6xl">
            Para cada momento del día
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-cream/80">
            Café de especialidad, gastronomía cuidada y repostería artesanal.
            Un espacio pensado para desayunar, trabajar, compartir o simplemente
            pausar.
          </p>
        </div>
      </section>

      <section className="section-padding mx-auto max-w-4xl">
        <div className="space-y-16">
          {menuCategories.map((category) => (
            <div key={category.id}>
              <h2 className="mb-8 border-b border-blue-deep/10 pb-4 font-display text-3xl text-blue-deep">
                {category.name}
              </h2>
              <ul className="space-y-6">
                {category.items.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-start justify-between gap-4"
                  >
                    <div>
                      <h3 className="font-medium text-charcoal">{item.name}</h3>
                      {item.description && (
                        <p className="mt-1 text-sm text-charcoal/60">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 font-medium text-blue-deep">
                      {formatPrice(item.price)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-16 text-center text-sm text-charcoal/50">
          Precios referenciales en pesos colombianos. Pueden variar según
          temporada.
        </p>
      </section>
    </>
  );
}

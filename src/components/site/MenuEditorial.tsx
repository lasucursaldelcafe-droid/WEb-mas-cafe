import { formatPrice } from "@/lib/store";
import type { MenuCategory } from "@/lib/types";

export function MenuEditorial({ menu }: { menu: MenuCategory[] }) {
  return (
    <div className="space-y-24">
      {menu.map((category, catIndex) => (
        <div key={category.id}>
          <div className="mb-12 flex items-baseline gap-6">
            <span className="font-accent text-6xl text-sage/80">
              {String(catIndex + 1).padStart(2, "0")}
            </span>
            <h2 className="font-display text-4xl text-blue-deep md:text-5xl">
              {category.name}
            </h2>
          </div>

          <ul className="divide-y divide-blue-deep/8">
            {category.items.map((item) => (
              <li
                key={item.name}
                className="flex flex-col gap-2 py-7 sm:flex-row sm:items-baseline sm:justify-between"
              >
                <div className="max-w-xl">
                  <h3 className="text-lg font-medium text-charcoal">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="mt-1 text-sm text-charcoal/55">
                      {item.description}
                    </p>
                  )}
                </div>
                <span className="shrink-0 font-display text-2xl text-blue-deep">
                  {formatPrice(item.price)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

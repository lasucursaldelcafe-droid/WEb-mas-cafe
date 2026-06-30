import { MenuEditorial } from "@/components/site/MenuEditorial";
import { BrandTitle } from "@/lib/brand-title";
import { getContent } from "@/lib/store";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menú",
};

export default async function MenuPage() {
  const { menu, pages } = await getContent();
  const headline = pages?.menu?.headline ?? "Para cada momento del día";

  return (
    <>
      <section className="bg-sage/30 pt-32 pb-16">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <p className="font-accent text-4xl text-blue-deep">Menú</p>
          <h1 className="mt-2 font-display text-5xl text-blue-deep md:text-6xl">
            <BrandTitle>{headline}</BrandTitle>
          </h1>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-6 py-20 md:px-12">
        <MenuEditorial menu={menu} />
        <p className="mt-16 text-center text-sm text-charcoal/45">
          Precios referenciales en COP. Pueden variar según temporada.
        </p>
      </section>
    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import { OrganicDecor } from "@/components/ui/OrganicDecor";
import type { Brand } from "@/lib/types";

export function EditorialHero({ brand }: { brand: Brand }) {
  return (
    <section className="relative min-h-screen overflow-hidden bg-blue-deep text-cream">
      <OrganicDecor index={0} className="right-0 top-20 h-64 w-64" />
      <OrganicDecor index={2} className="bottom-32 left-0 h-48 w-48" />

      <div className="absolute inset-0">
        <div className="absolute right-[-10%] top-[15%] h-[70vh] w-[55vw] max-w-3xl opacity-90">
          <Image
            src="/images/grafica/3.png"
            alt=""
            fill
            className="object-contain object-right float-soft"
            priority
            sizes="55vw"
          />
        </div>
        <div className="absolute bottom-0 left-[5%] hidden h-[45vh] w-[35vw] max-w-md lg:block">
          <Image
            src="/images/grafica/1.png"
            alt=""
            fill
            className="object-contain object-bottom"
            sizes="35vw"
          />
        </div>
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1400px] flex-col justify-end px-6 pb-24 pt-40 md:px-12 md:pb-32">
        <div className="max-w-3xl">
          <p className="font-accent text-4xl text-sage md:text-5xl lg:text-6xl">
            {brand.tagline}
          </p>
          <h1 className="mt-6 text-balance font-display text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.95] tracking-tight">
            {brand.headline}
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-cream/75 md:text-xl">
            {brand.subheadline}
          </p>
          <p className="mt-4 text-sm uppercase tracking-[0.3em] text-cream/50">
            {brand.descriptor}
          </p>
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-5">
          <Link
            href="/tienda"
            className="rounded-full bg-sage px-10 py-4 text-sm font-bold text-blue-deep transition hover:bg-cream"
          >
            Comprar café fresco
          </Link>
          <Link
            href="/nosotros"
            className="rounded-full border border-cream/25 px-10 py-4 text-sm font-medium transition hover:bg-cream/10"
          >
            Nuestra historia
          </Link>
        </div>

        <div className="mt-20 flex items-center gap-6">
          <Image
            src="/images/brand/favs.png"
            alt=""
            width={56}
            height={56}
            className="opacity-80"
          />
          <p className="max-w-xs text-sm leading-relaxed text-cream/50">
            Una experiencia que se vive sin prisa. Hospitalidad consciente en
            Cali.
          </p>
        </div>
      </div>
    </section>
  );
}

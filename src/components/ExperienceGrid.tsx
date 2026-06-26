import Image from "next/image";
import Link from "next/link";
import { experiences } from "@/lib/data";

export function ExperienceGrid() {
  return (
    <section className="section-padding mx-auto max-w-7xl">
      <div className="mb-16 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-brown-light">
          La experiencia
        </p>
        <h2 className="text-balance font-display text-4xl text-blue-deep md:text-5xl">
          Una experiencia que se vive sin prisa
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-charcoal/70">
          En Más Café creemos que cada taza es una oportunidad para detenerse,
          conectar y disfrutar el momento. Nuestro espacio está diseñado para
          acompañar conversaciones, ideas y encuentros cotidianos.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {experiences.map((item) => (
          <article
            key={item.id}
            className="group overflow-hidden rounded-3xl bg-white shadow-sm transition hover:shadow-lg"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-cream-dark">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
            </div>
            <div className="p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-brown-light">
                {item.subtitle}
              </p>
              <h3 className="mt-1 font-display text-2xl text-blue-deep">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                {item.description}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/nosotros"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-deep hover:text-green"
        >
          Descubre nuestra historia
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}

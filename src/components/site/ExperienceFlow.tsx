import Image from "next/image";
import Link from "next/link";
import { WaveDivider } from "@/components/ui/OrganicDecor";
import { BrandTitle } from "@/lib/brand-title";
import type { Experience } from "@/lib/types";

export function ExperienceFlow({
  experiences,
}: {
  experiences: Experience[];
}) {
  return (
    <section className="relative bg-cream">
      <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-12 md:py-32">
        <div className="mb-20 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-brown-light">
            La experiencia
          </p>
          <h2 className="mt-4 font-display text-[clamp(2.2rem,5vw,4rem)] leading-tight text-blue-deep">
            <BrandTitle>Una experiencia que se vive sin prisa</BrandTitle>
          </h2>
        </div>

        <div className="space-y-0">
          {experiences.map((exp, index) => {
            const isRight = exp.layout === "right";
            return (
              <article
                key={exp.id}
                className={`relative flex flex-col gap-8 py-16 md:gap-0 ${
                  index > 0 ? "border-t border-blue-deep/8" : ""
                } ${isRight ? "md:flex-row-reverse" : "md:flex-row"} md:items-center md:py-24`}
              >
                <div
                  className={`relative md:w-[52%] ${
                    isRight ? "md:pl-16" : "md:pr-16"
                  }`}
                >
                  <div
                    className={`relative aspect-[4/5] overflow-hidden ${
                      isRight ? "rounded-[3rem_1rem_3rem_1rem]" : "rounded-[1rem_3rem_1rem_3rem]"
                    } organic-shadow`}
                  >
                    <Image
                      src={exp.image}
                      alt={exp.title}
                      fill
                      className="object-cover"
                      sizes="52vw"
                    />
                  </div>
                  <span
                    className={`absolute -bottom-4 font-accent text-7xl text-sage/80 md:text-8xl ${
                      isRight ? "left-8" : "right-8"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div
                  className={`md:w-[48%] ${
                    isRight ? "md:pr-8 md:text-right" : "md:pl-8"
                  }`}
                >
                  <p className="text-xs font-medium uppercase tracking-[0.25em] text-brown-light">
                    {exp.subtitle}
                  </p>
                  <h3 className="mt-3 font-display text-5xl text-blue-deep md:text-6xl">
                    <BrandTitle>{exp.title}</BrandTitle>
                  </h3>
                  <p className="mt-6 max-w-md text-lg leading-relaxed text-charcoal/70">
                    {exp.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/nosotros"
            className="inline-flex items-center gap-3 font-medium text-blue-deep hover:text-green"
          >
            Conoce nuestra historia
            <span className="text-xl">→</span>
          </Link>
        </div>
      </div>
      <WaveDivider color="fill-blue-deep" />
    </section>
  );
}

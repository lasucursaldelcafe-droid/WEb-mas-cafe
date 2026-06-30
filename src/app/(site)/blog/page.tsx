import Image from "next/image";
import { BrandTitle } from "@/lib/brand-title";
import { getContent } from "@/lib/store";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
};

export default async function BlogPage() {
  const { blog } = await getContent();
  const published = blog.filter((p) => p.published);

  return (
    <>
      <section className="bg-sage/30 pt-32 pb-16">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <p className="font-accent text-4xl text-blue-deep">Blog</p>
          <h1 className="mt-2 font-display text-5xl md:text-6xl">
            <BrandTitle>Historias & origen</BrandTitle>
          </h1>
        </div>
      </section>
      <section className="mx-auto max-w-[1400px] space-y-20 px-6 py-20 md:px-12">
        {published.map((post, i) => (
          <article
            key={post.id}
            id={post.id}
            className={`scroll-mt-24 flex flex-col gap-8 ${
              i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
            } lg:items-center`}
          >
            <div className="relative aspect-[16/10] flex-1 overflow-hidden rounded-[2rem_4rem_2rem_4rem] organic-shadow">
              <Image src={post.image} alt={post.title} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-brown-light">
                {post.category} · {post.date}
              </p>
              <h2 className="mt-3 font-display text-4xl text-blue-deep">
                <BrandTitle>{post.title}</BrandTitle>
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-charcoal/70">
                {post.excerpt}
              </p>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

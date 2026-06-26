import Image from "next/image";
import { blogPosts } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Historias, origen, barismo y curiosidades sobre el mundo del café.",
};

export default function BlogPage() {
  return (
    <>
      <section className="bg-blue-deep py-24 text-cream md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <p className="font-accent text-3xl text-sage">Blog Más Café</p>
          <h1 className="mt-4 font-display text-5xl md:text-6xl">
            Conocimiento, historias y café
          </h1>
        </div>
      </section>

      <section className="section-padding mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              id={post.id}
              className="scroll-mt-24 overflow-hidden rounded-3xl bg-white shadow-sm"
            >
              <div className="relative aspect-[16/9] bg-sage/30">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-8">
                <p className="text-xs font-medium uppercase tracking-wider text-brown-light">
                  {post.category} · {post.date}
                </p>
                <h2 className="mt-2 font-display text-2xl text-blue-deep">
                  {post.title}
                </h2>
                <p className="mt-4 leading-relaxed text-charcoal/70">
                  {post.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

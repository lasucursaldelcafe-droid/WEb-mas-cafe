import Image from "next/image";
import Link from "next/link";
import { blogPosts } from "@/lib/data";

export function BlogSection({ limit = 3 }: { limit?: number }) {
  const posts = blogPosts.slice(0, limit);

  return (
    <section className="section-padding mx-auto max-w-7xl">
      <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-brown-light">
            Blog Más Café
          </p>
          <h2 className="font-display text-4xl text-blue-deep md:text-5xl">
            Historias, origen y café
          </h2>
          <p className="mt-4 max-w-xl text-charcoal/70">
            Nuestro canal para compartir conocimiento, historias y cosas bacanas
            sobre el mundo del café.
          </p>
        </div>
        <Link
          href="/blog"
          className="shrink-0 text-sm font-medium text-blue-deep hover:text-green"
        >
          Ver todos los artículos →
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {posts.map((post) => (
          <article key={post.id} className="group">
            <Link href={`/blog#${post.id}`} className="block">
              <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-2xl bg-sage/30">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <p className="text-xs font-medium uppercase tracking-wider text-brown-light">
                {post.category} · {post.date}
              </p>
              <h3 className="mt-2 font-display text-xl text-blue-deep group-hover:text-green">
                {post.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
                {post.excerpt}
              </p>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

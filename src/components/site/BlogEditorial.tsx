import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/types";

export function BlogEditorial({ posts }: { posts: BlogPost[] }) {
  const published = posts.filter((p) => p.published);
  const [featured, ...rest] = published;

  if (!featured) return null;

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="mb-16 flex items-end justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-brown-light">
              Blog
            </p>
            <h2 className="mt-3 font-display text-4xl text-blue-deep md:text-5xl">
              Historias & origen
            </h2>
          </div>
          <Link
            href="/blog"
            className="hidden text-sm font-medium text-blue-deep hover:text-green md:block"
          >
            Ver todo →
          </Link>
        </div>

        <div className="flex flex-col gap-12 lg:flex-row lg:gap-8">
          <Link
            href={`/blog#${featured.id}`}
            className="group relative lg:w-[58%]"
          >
            <div className="relative aspect-[16/11] overflow-hidden rounded-[3rem_1rem_3rem_1rem] organic-shadow">
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
                sizes="58vw"
              />
            </div>
            <div className="mt-6 max-w-lg">
              <p className="text-xs uppercase tracking-wider text-brown-light">
                {featured.category} · {featured.date}
              </p>
              <h3 className="mt-2 font-display text-3xl text-blue-deep group-hover:text-green md:text-4xl">
                {featured.title}
              </h3>
              <p className="mt-3 text-charcoal/70">{featured.excerpt}</p>
            </div>
          </Link>

          <div className="flex flex-col justify-center gap-10 lg:w-[42%] lg:pl-4">
            {rest.slice(0, 3).map((post) => (
              <Link
                key={post.id}
                href={`/blog#${post.id}`}
                className="group flex gap-5 border-b border-blue-deep/8 pb-8 last:border-0"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
                  <Image
                    src={post.image}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs text-brown-light">
                    {post.category} · {post.date}
                  </p>
                  <h3 className="mt-1 font-display text-xl text-blue-deep group-hover:text-green">
                    {post.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

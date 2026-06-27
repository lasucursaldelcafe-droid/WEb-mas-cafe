import siteData from "../../content/site.json";
import { assetPath } from "./paths";
import type { SiteContent } from "./types";

export async function getContent(): Promise<SiteContent> {
  const data = siteData as SiteContent;
  return {
    ...data,
    experiences: data.experiences.map((exp) => ({
      ...exp,
      image: assetPath(exp.image),
    })),
    products: data.products.map((product) => ({
      ...product,
      image: assetPath(product.image),
    })),
    blog: data.blog.map((post) => ({
      ...post,
      image: assetPath(post.image),
    })),
  };
}

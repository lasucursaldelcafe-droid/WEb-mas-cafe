import { BlogEditorial } from "@/components/site/BlogEditorial";
import { SubscriptionBand, VisitBand } from "@/components/site/CTABands";
import { EditorialHero } from "@/components/site/EditorialHero";
import { ExperienceFlow } from "@/components/site/ExperienceFlow";
import { ProductRiver } from "@/components/site/ProductRiver";
import { StorySection, ValuesBand } from "@/components/site/StorySection";
import { Marquee } from "@/components/ui/OrganicDecor";
import { getContent } from "@/lib/store";

export default async function HomePage() {
  const content = await getContent();

  return (
    <>
      <EditorialHero brand={content.brand} />
      <Marquee items={content.marquee} />
      <ExperienceFlow experiences={content.experiences} />
      <ProductRiver products={content.products} />
      <StorySection brand={content.brand} />
      <ValuesBand brand={content.brand} />
      <SubscriptionBand brand={content.brand} />
      <BlogEditorial posts={content.blog} />
      <VisitBand brand={content.brand} />
    </>
  );
}

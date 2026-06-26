import { BlogSection } from "@/components/BlogSection";
import { SubscriptionCTA, VisitCTA } from "@/components/CTASections";
import { ExperienceGrid } from "@/components/ExperienceGrid";
import { Hero } from "@/components/Hero";
import { ProductShowcase } from "@/components/ProductShowcase";
import { PurposeSection } from "@/components/PurposeSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ExperienceGrid />
      <ProductShowcase />
      <PurposeSection />
      <SubscriptionCTA />
      <BlogSection />
      <VisitCTA />
    </>
  );
}

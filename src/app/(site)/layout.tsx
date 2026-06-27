import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { AnalyticsTracker } from "@/components/site/AnalyticsTracker";
import { getContent } from "@/lib/store";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { brand } = await getContent();

  return (
    <>
      <AnalyticsTracker />
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter brand={brand} />
    </>
  );
}

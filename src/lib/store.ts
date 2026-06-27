import siteData from "../../content/site.json";
import type { SiteContent } from "./types";

export async function getContent(): Promise<SiteContent> {
  return siteData as SiteContent;
}

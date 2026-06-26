import { readFile, writeFile } from "fs/promises";
import path from "path";
import type { SiteContent } from "./types";

const CONTENT_PATH = path.join(process.cwd(), "content", "site.json");

export async function getContent(): Promise<SiteContent> {
  const raw = await readFile(CONTENT_PATH, "utf-8");
  return JSON.parse(raw) as SiteContent;
}

export async function saveContent(content: SiteContent): Promise<void> {
  await writeFile(CONTENT_PATH, JSON.stringify(content, null, 2), "utf-8");
}

export function formatPrice(cop: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(cop);
}

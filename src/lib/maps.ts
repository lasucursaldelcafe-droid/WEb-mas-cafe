import type { Brand } from "@/lib/types";

export function getMapsUrl(brand: Pick<Brand, "address" | "city">) {
  return `https://maps.google.com/?q=${encodeURIComponent(`${brand.address}, ${brand.city}`)}`;
}

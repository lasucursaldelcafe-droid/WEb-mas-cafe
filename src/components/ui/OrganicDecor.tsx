import Image from "next/image";
import { assetPath } from "@/lib/paths";

const decorPaths = [
  assetPath("/images/decor/Recurso-4.svg"),
  assetPath("/images/decor/Recurso-5.svg"),
  assetPath("/images/decor/Recurso-6.svg"),
  assetPath("/images/decor/Recurso-7.svg"),
];

export function OrganicDecor({
  index = 0,
  className = "",
}: {
  index?: number;
  className?: string;
}) {
  const src = decorPaths[index % decorPaths.length];
  return (
    <div
      className={`pointer-events-none absolute opacity-[0.12] ${className}`}
      aria-hidden
    >
      <Image src={src} alt="" width={200} height={200} className="h-full w-full" />
    </div>
  );
}

export function WaveDivider({
  flip = false,
  color = "fill-cream",
}: {
  flip?: boolean;
  color?: string;
}) {
  return (
    <div className={`w-full overflow-hidden leading-none ${flip ? "rotate-180" : ""}`}>
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className={`block h-12 w-full md:h-20 ${color}`}
      >
        <path d="M0,40 C360,90 720,0 1080,50 C1260,70 1380,60 1440,40 L1440,80 L0,80 Z" />
      </svg>
    </div>
  );
}

export function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-blue-deep/10 bg-sage/30 py-5">
      <div className="marquee-track flex w-max gap-12 whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-12 text-sm font-medium uppercase tracking-[0.25em] text-blue-deep/70"
          >
            {item}
            <span className="inline-block h-2 w-2 rounded-full bg-brown-light" />
          </span>
        ))}
      </div>
    </div>
  );
}

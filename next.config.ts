import type { NextConfig } from "next";

// GitHub Pages (proyecto): /WEb-mas-cafe — dominio propio: raíz /
const repo = "WEb-mas-cafe";
const useBasePath = process.env.GITHUB_PAGES === "true";

const basePath = useBasePath ? `/${repo}` : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: useBasePath ? `${basePath}/` : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;

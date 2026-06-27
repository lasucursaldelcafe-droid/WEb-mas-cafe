import type { NextConfig } from "next";

// GitHub Pages (proyecto): /WEb-mas-cafe — dominio propio: raíz /
const repo = "WEb-mas-cafe";
const useBasePath = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: useBasePath ? `/${repo}` : "",
  assetPrefix: useBasePath ? `/${repo}/` : undefined,
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

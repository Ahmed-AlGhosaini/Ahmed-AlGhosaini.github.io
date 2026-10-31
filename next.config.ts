import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export to `out/` — host anywhere (Vercel, Netlify, GitHub Pages).
  output: "export",
  images: { unoptimized: true },
  // Note: cacheComponents / partialPrefetching enable PPR, which is incompatible with `output: "export"`.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

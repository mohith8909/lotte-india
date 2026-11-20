import type { NextConfig } from "next";

// GitHub Pages build (see .github/workflows/pages.yml): a fully static export served from
// https://<user>.github.io/<repo>/. Local `next dev` / `next build` are unaffected.
const isPages = process.env.GITHUB_PAGES === "true";
const basePath = isPages ? (process.env.PAGES_BASE_PATH ?? "") : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(isPages && {
    output: "export",
    basePath,
    trailingSlash: true, // /story/ → story/index.html, which GitHub Pages serves directly
    images: { unoptimized: true }, // no image optimisation server on static hosting
  }),
  // next/image does not prefix basePath onto string src values; expose it to the client.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;

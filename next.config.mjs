/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ESLint is run via `npm run lint` in CI rather than during the production
  // build, so a lint nit never blocks a deploy.
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    // Listing photos / KYC documents are uploaded through server actions;
    // the default 1MB body limit is far too small for images.
    serverActions: { bodySizeLimit: "12mb" },
  },
  images: {
    // Remote demo imagery (swap/extend for production CDN).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // ---------------------------------------------------------------------------
  // Capacitor (mobile) note:
  // For the iOS/Android wrappers we ship a static export and point Capacitor at
  // the `out/` directory. Enable that build with `BUILD_TARGET=capacitor`,
  // which turns on `output: 'export'`. The default (web) build keeps SSR so the
  // marketing site stays SEO-strong. See capacitor.config.ts and README §Mobile.
  ...(process.env.BUILD_TARGET === "capacitor"
    ? { output: "export", images: { unoptimized: true } }
    : {}),
};

export default nextConfig;

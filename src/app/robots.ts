import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = SITE.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app", "/host", "/transfer", "/admin", "/login"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Proxy static assets under `/data` so we can serve them locally during
   * development, and from the CDN domain in production (Vercel).
   */
  async rewrites() {
    const isDev = process.env.NODE_ENV === "development";

    // In development, serve directly from `public/data` (no rewrite needed).
    if (isDev) {
      return [];
    }

    // In production, pull from the CDN domain.
    return [
      {
        source: "/data/:path*",
        destination: "https://upload.jishicv.com/data/:path*",
      },
    ];
  },
};

export default nextConfig;

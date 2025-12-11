import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Static assets are loaded directly from official CDN in production.
   * Development uses local `/data/` from `public/data`.
   * No rewrite needed since GamePlayer.tsx uses CDN URLs directly.
   */
};

export default nextConfig;

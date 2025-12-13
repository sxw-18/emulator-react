import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Static assets are loaded directly from official CDN in production.
   * Development uses local `/data/` from `public/data`.
   * No rewrite needed since GamePlayer.tsx uses CDN URLs directly.
   */
  output: 'standalone', // 启用静态导出，生成可直接部署的静态文件到 out 目录
  compress: true, // 启用 gzip 压缩
  poweredByHeader: false, // 移除 X-Powered-By 头（安全最佳实践）
};

export default nextConfig;

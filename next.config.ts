import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration (Next.js 16+ default)
  // Empty config to silence the warning - Turbopack handles react-pdf without extra config
  turbopack: {},
  // Keep webpack config for compatibility (when using --webpack flag)
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;

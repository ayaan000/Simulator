import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/Simulator',
  assetPrefix: '/Simulator/',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

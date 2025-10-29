import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Remove images configuration or keep it minimal
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
 experimental: {
    serverComponentsExternalPackages: [],
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

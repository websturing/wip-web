import type { NextConfig } from "next";

const isCapacitor = process.env.IS_CAPACITOR === 'true';

const nextConfig: NextConfig = {
  output: isCapacitor ? 'export' : undefined,
  trailingSlash: isCapacitor,
  images: {
    unoptimized: true,
  },
  experimental: {},
};

export default nextConfig;




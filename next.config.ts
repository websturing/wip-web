import type { NextConfig } from "next";

import withPWAInit from "@ducanh2912/next-pwa";

const isCapacitor = process.env.IS_CAPACITOR === 'true';

const nextConfig: NextConfig = {
  output: isCapacitor ? 'export' : undefined,
  trailingSlash: isCapacitor,
  images: {
    unoptimized: true,
  },
  experimental: {},
  turbopack: {},
};

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  fallbacks: {
    document: "/offline",
  },
});

export default withPWA(nextConfig);




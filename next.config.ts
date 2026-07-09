import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const isCapacitor = process.env.IS_CAPACITOR === "true";
const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // Saat development tidak pakai /frontend
  // Saat production otomatis pakai /frontend
  basePath: isDev ? "" : "",

  output: isCapacitor ? "export" : undefined,

  trailingSlash: isCapacitor,

  images: {
    unoptimized: true,
  },

  experimental: {},

  turbopack: {},
};

const withPWA = withPWAInit({
  dest: "public",
  disable: isDev,

  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,

  fallbacks: {
    document: "/offline",
  },
});

export default withPWA(nextConfig);
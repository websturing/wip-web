import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopack: {
      // Explicitly set the workspace root relative to this file
      root: ".",
    },
  },
};

export default nextConfig;

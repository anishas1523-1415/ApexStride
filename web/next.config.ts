import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Allow remote images if needed, but not strictly required unless loading from external CDN
};

export default nextConfig;

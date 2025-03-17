import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ["www.youtube.com", "youtube.com"]
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
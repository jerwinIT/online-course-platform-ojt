import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    domains: ["lh3.googleusercontent.com", "cdn.example.com", "unsplash.com"],
  },
};

export default nextConfig;

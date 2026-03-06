import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "cdn.example.com",
      "images.unsplash.com",
      "plus.unsplash.com"
    ],
  },
};

export default nextConfig;

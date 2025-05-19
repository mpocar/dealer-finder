import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: "http://localhost:4000",
    // NEXT_PUBLIC_API_URL: "https://prod-backend-nfti.encr.app",
  },
  images: {
    domains: ["images.unsplash.com"],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Placeholder photo hosts used by the mock destinations fixtures.
    // Swap/extend when real image storage lands.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      // Avatar placeholders for landing testimonials.
      { protocol: "https", hostname: "i.pravatar.cc" },
    ],
  },
};

export default nextConfig;

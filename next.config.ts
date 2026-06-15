import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Placeholder photo hosts used by the mock destinations fixtures.
    // Swap/extend when real image storage lands.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "unsplash.com" },
      // Avatar placeholders for landing testimonials.
      { protocol: "https", hostname: "i.pravatar.cc" },
      // Generated avatar placeholders (e.g. agency/tour avatars).
      { protocol: "https", hostname: "api.dicebear.com" },
      // Fallback image when a destination/tour has no cover (see explore/data.ts).
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
};

export default nextConfig;

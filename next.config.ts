import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Placeholder photo hosts used by the mock destinations fixtures.
    // Swap/extend when real image storage lands.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      // Local RustFS/MinIO — dev image storage
      { protocol: "http", hostname: "localhost", port: "9000" },
      // UI-Avatars for agency/traveler profile placeholders
      { protocol: "https", hostname: "ui-avatars.com" },
      // Google user content (e.g. images uploaded via Google accounts)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Generic placeholder images (placehold.co)
      { protocol: "https", hostname: "placehold.co" },
      // DiceBear avatar generation (initials, avatars)
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
};

export default nextConfig;

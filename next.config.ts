import type { NextConfig } from "next";
import path from "path";

// @dayflow/core nests its own Preact copy. Without aliasing, Turbopack/webpack
// creates two Preact instances with separate `currentComponent` module-level
// variables, causing "Cannot read properties of undefined (reading '__H')"
// when DayFlow's Preact hooks fire inside React's commit phase.
// Force every "preact" import to the same instance to share that state.
const preactRoot = path.join(
  __dirname,
  "node_modules/@dayflow/core/node_modules/preact"
);

const nextConfig: NextConfig = {
  // Turbopack (next dev) — uses relative paths from the project root
  turbopack: {
    resolveAlias: {
      preact: "./node_modules/@dayflow/core/node_modules/preact",
      "preact/hooks": "./node_modules/@dayflow/core/node_modules/preact/hooks",
      "preact/compat":
        "./node_modules/@dayflow/core/node_modules/preact/compat",
    },
  },
  // Webpack (next build) — uses absolute paths
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      preact: preactRoot,
      "preact/hooks": path.join(preactRoot, "hooks"),
      "preact/compat": path.join(preactRoot, "compat"),
    };
    return config;
  },
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
      // Legacy seed-data.sql placeholder host (@destination.dev dataset).
      { protocol: "https", hostname: "img.dev" },
      { protocol: "https", hostname: "ui-avatars.com" },
      // Generated avatar placeholders (e.g. agency/tour avatars).
      { protocol: "https", hostname: "api.dicebear.com" },
      // Fallback image when a destination/tour has no cover (see explore/data.ts).
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
};

export default nextConfig;

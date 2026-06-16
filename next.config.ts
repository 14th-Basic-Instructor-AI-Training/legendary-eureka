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
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  experimental: {
    // Avatar/cover uploads stream the image file through a Server Action; the
    // default 1 MB Server Action body cap rejects normal photos. Raise it so
    // profile image uploads succeed (storage itself goes to RustFS/S3).
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;

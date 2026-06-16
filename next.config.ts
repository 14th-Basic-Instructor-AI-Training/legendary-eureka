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
      // Local S3/MinIO (RustFS) storage — the `hostname: "**"` wildcard doesn't
      // match the single-segment `localhost` with an explicit port, so the image
      // optimizer would reject uploaded cover/photo URLs (`localhost:9000/...`).
      { protocol: "http", hostname: "localhost", port: "9000" },
      { protocol: "http", hostname: "127.0.0.1", port: "9000" },
    ],
    // Next 16's optimizer blocks upstream images that resolve to a private/
    // loopback IP (SSRF guard). Our dev storage (MinIO at localhost:9000)
    // resolves to 127.0.0.1/::1, so allow it for local development.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
};

export default nextConfig;

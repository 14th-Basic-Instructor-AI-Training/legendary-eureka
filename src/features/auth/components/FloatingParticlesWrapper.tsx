"use client";

import dynamic from "next/dynamic";

const FloatingParticlesBackground = dynamic(
  () =>
    import("./FloatingParticlesBackground").then((m) => ({
      default: m.FloatingParticlesBackground,
    })),
  { ssr: false },
);

export function FloatingParticlesWrapper() {
  return <FloatingParticlesBackground />;
}

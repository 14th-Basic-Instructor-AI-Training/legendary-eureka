"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  driftX: number;
  driftY: number;
  color: string;
};

const PARTICLE_COLORS = [
  "#4FB5DB",
  "#84CDE9",
  "#9BE0E7",
  "#556EEB",
  "#C486F4",
];

const PARTICLE_COUNT = 55;

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1.5,
    duration: Math.random() * 18 + 10,
    delay: -(Math.random() * 20),
    opacity: Math.random() * 0.45 + 0.08,
    driftX: (Math.random() - 0.5) * 80,
    driftY: -(Math.random() * 130 + 30),
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
  }));
}

export function FloatingParticlesBackground() {
  // Lazy initializer — runs only on the client (ssr:false import prevents server execution)
  const [particles] = useState<Particle[]>(generateParticles);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 30, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 30, damping: 20 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleMouseMove(e: MouseEvent) {
      const rect = container!.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      mouseX.set(((e.clientX - rect.left - cx) / cx) * 18);
      mouseY.set(((e.clientY - rect.top - cy) / cy) * 18);
    }

    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Soft radial glow in the center */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(79,181,219,0.10) 0%, transparent 70%)",
        }}
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.size * 1.5}px ${p.color}55`,
            x: springX,
            y: springY,
          }}
          animate={{
            translateY: [0, p.driftY, 0],
            translateX: [0, p.driftX, 0],
            opacity: [p.opacity, Math.min(p.opacity * 2.2, 0.8), p.opacity],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Large blurred orbs for depth */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 320,
          height: 320,
          left: "10%",
          top: "20%",
          background: "radial-gradient(circle, rgba(79,181,219,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
          x: springX,
          y: springY,
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 260,
          height: 260,
          right: "8%",
          bottom: "15%",
          background: "radial-gradient(circle, rgba(196,134,244,0.10) 0%, transparent 70%)",
          filter: "blur(40px)",
          x: springX,
          y: springY,
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 10, delay: -4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 200,
          height: 200,
          right: "25%",
          top: "10%",
          background: "radial-gradient(circle, rgba(85,110,235,0.08) 0%, transparent 70%)",
          filter: "blur(32px)",
          x: springX,
          y: springY,
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 12, delay: -6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

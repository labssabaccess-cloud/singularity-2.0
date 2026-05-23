"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TOOLS, type Tool } from "@/lib/tools";
import BubbleNode from "./BubbleNode";

const SIZE_MAP = { anchor: 130, large: 100, medium: 78, small: 58 } as const;

interface BubbleMapFieldProps {
  onToolClick: (tool: Tool) => void;
}

function ConnectorLines({
  centerX,
  centerY,
  positions,
}: {
  centerX: number;
  centerY: number;
  positions: { id: string; cx: number; cy: number; ready: boolean }[];
}) {
  const ready = positions.filter((p) => {
    const tool = TOOLS.find((t) => t.id === p.id);
    return tool?.ready && tool.size !== "anchor";
  });

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {/* All nodes: faint gray lines */}
      {positions.map((p) => {
        const tool = TOOLS.find((t) => t.id === p.id);
        if (tool?.size === "anchor") return null;
        if (tool?.ready) return null; // ready lines drawn separately
        return (
          <line
            key={p.id}
            x1={centerX}
            y1={centerY}
            x2={p.cx}
            y2={p.cy}
            stroke="rgba(250,250,250,0.05)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
        );
      })}

      {/* Ready nodes: glowing lines */}
      {ready.map((p) => {
        const tool = TOOLS.find((t) => t.id === p.id)!;
        return (
          <motion.line
            key={p.id}
            x1={centerX}
            y1={centerY}
            x2={p.cx}
            y2={p.cy}
            stroke={tool.glowColor.replace("0.55", "0.45")}
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        );
      })}
    </svg>
  );
}

function AmbientParticles() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const particles = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: ((i * 79 + 31) % 100),
      y: ((i * 53 + 17) % 100),
      size: 1 + ((i * 7) % 3),
      dur: 8 + ((i * 3) % 12),
      delay: ((i * 19) % 80) / 10,
    })),
  []);

  if (!mounted) return null;

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: "rgba(120,140,255,0.4)",
          }}
          animate={{
            y: [0, -24, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function BubbleMapField({ onToolClick }: BubbleMapFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 900, h: 640 });

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        setDims({ w: r.width, h: r.height });
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const { positions, centerX, centerY } = useMemo(() => {
    const cx = dims.w / 2;
    const cy = dims.h / 2;
    const shortSide = Math.min(dims.w, dims.h);
    const maxR = shortSide * 0.44;

    const positions = TOOLS.map((tool) => {
      if (tool.size === "anchor") {
        return {
          id: tool.id,
          cx,
          cy,
          x: cx - SIZE_MAP.anchor / 2,
          y: cy - SIZE_MAP.anchor / 2,
          ready: tool.ready,
        };
      }
      const angleRad = (tool.angle * Math.PI) / 180;
      const r = maxR * (tool.radius / 60);
      const px = cx + Math.cos(angleRad) * r;
      const py = cy + Math.sin(angleRad) * r;
      return {
        id: tool.id,
        cx: px,
        cy: py,
        x: px - SIZE_MAP[tool.size] / 2,
        y: py - SIZE_MAP[tool.size] / 2,
        ready: tool.ready,
      };
    });
    return { positions, centerX: cx, centerY: cy };
  }, [dims]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 520,
        overflow: "hidden",
      }}
    >
      <AmbientParticles />

      <ConnectorLines
        centerX={centerX}
        centerY={centerY}
        positions={positions}
      />

      {TOOLS.map((tool, i) => {
        const pos = positions.find((p) => p.id === tool.id)!;
        return (
          <BubbleNode
            key={tool.id}
            tool={tool}
            index={i}
            style={{ left: pos.x, top: pos.y }}
            onClick={onToolClick}
          />
        );
      })}
    </div>
  );
}

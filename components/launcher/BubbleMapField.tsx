"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TOOLS, type Tool } from "@/lib/tools";
import { getCompleted } from "@/lib/progress";
import BubbleNode from "./BubbleNode";

const SIZE_MAP = { anchor: 130, large: 105, medium: 82, small: 62 } as const;

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
      {positions.map((p) => {
        const tool = TOOLS.find((t) => t.id === p.id);
        if (tool?.size === "anchor") return null;
        const isReady = tool?.ready;
        // Use <motion.path> with d attribute — pathLength only works on <path>, not <line>
        return isReady ? (
          <motion.path
            key={p.id}
            d={`M ${centerX} ${centerY} L ${p.cx} ${p.cy}`}
            stroke={tool!.glowColor.replace("0.55", "0.5")}
            strokeWidth="1.5"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        ) : (
          <line
            key={p.id}
            x1={centerX} y1={centerY} x2={p.cx} y2={p.cy}
            stroke="rgba(250,250,250,0.04)"
            strokeWidth="1"
            strokeDasharray="3 8"
          />
        );
      })}
    </svg>
  );
}

function CategoryLabel({ label, x, y }: { label: string; x: number; y: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 2,
        padding: "3px 8px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "999px",
        fontSize: "0.62rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "rgba(250,250,250,0.3)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  );
}

function AmbientParticles() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const particles = useMemo(() =>
    Array.from({ length: 22 }, (_, i) => ({
      id: i,
      x: ((i * 79 + 31) % 100),
      y: ((i * 53 + 17) % 100),
      size: 1 + ((i * 7) % 3),
      dur: 10 + ((i * 3) % 14),
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
            background: "rgba(120,140,255,0.35)",
          }}
          animate={{ y: [0, -28, 0], opacity: [0, 0.5, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export default function BubbleMapField({ onToolClick }: BubbleMapFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 1200, h: 700 });
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCompleted(getCompleted());
    const handler = () => setCompleted(getCompleted());
    window.addEventListener("sg_progress", handler);
    return () => window.removeEventListener("sg_progress", handler);
  }, []);

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

  const { positions, centerX, centerY, categoryLabels } = useMemo(() => {
    const cx = dims.w / 2;
    const cy = dims.h / 2;

    // Scale radius so the outermost bubble (radius:70 in data) maps to
    // ~44% of the shorter viewport dimension — keeps everything on-screen
    // and gives ~1 bubble-diameter of breathing room from the edge.
    const shortSide = Math.min(dims.w, dims.h);
    const scale = (shortSide * 0.44) / 70;

    const positions = TOOLS.map((tool) => {
      if (tool.size === "anchor") {
        return { id: tool.id, cx, cy, x: cx - SIZE_MAP.anchor / 2, y: cy - SIZE_MAP.anchor / 2, ready: tool.ready };
      }
      const angleRad = (tool.angle * Math.PI) / 180;
      const r = tool.radius * scale;
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

    // Category arc labels — placed 18% beyond outermost data radius
    const categoryAngles: Record<string, number[]> = {};
    TOOLS.forEach((t) => {
      if (t.size === "anchor") return;
      if (!categoryAngles[t.category]) categoryAngles[t.category] = [];
      categoryAngles[t.category].push(t.angle);
    });
    const categoryLabels: { label: string; x: number; y: number }[] = [];
    const CAT_LABELS: Record<string, string> = {
      "ai-chat": "AI Chat",
      "image-gen": "Image AI",
      "video-gen": "Video AI",
      "audio-gen": "Audio AI",
      productivity: "Productivity",
      dev: "Dev & ML",
    };
    Object.entries(categoryAngles).forEach(([cat, angles]) => {
      const avg = angles.reduce((a, b) => a + b, 0) / angles.length;
      const rad = (avg * Math.PI) / 180;
      const labelR = 70 * scale * 1.18;
      categoryLabels.push({
        label: CAT_LABELS[cat] ?? cat,
        x: cx + Math.cos(rad) * labelR,
        y: cy + Math.sin(rad) * labelR,
      });
    });

    return { positions, centerX: cx, centerY: cy, categoryLabels };
  }, [dims]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 580,
        overflow: "hidden",
      }}
    >
      <AmbientParticles />
      <ConnectorLines centerX={centerX} centerY={centerY} positions={positions} />

      {categoryLabels.map((cl) => (
        <CategoryLabel key={cl.label} label={cl.label} x={cl.x} y={cl.y} />
      ))}

      {TOOLS.map((tool, i) => {
        const pos = positions.find((p) => p.id === tool.id)!;
        const isDone = completed.has(tool.id);
        return (
          <BubbleNode
            key={tool.id}
            tool={tool}
            index={i}
            style={{ left: pos.x, top: pos.y }}
            onClick={onToolClick}
            completed={isDone}
          />
        );
      })}
    </div>
  );
}

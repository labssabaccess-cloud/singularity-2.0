"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TOOLS, type Tool } from "@/lib/tools";
import { getCompleted } from "@/lib/progress";
import BubbleNode from "./BubbleNode";

const SIZE_MAP = { anchor: 134, large: 108, medium: 84, small: 64 } as const;

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
      <defs>
        <filter id="glow-line">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {positions.map((p) => {
        const tool = TOOLS.find((t) => t.id === p.id);
        if (tool?.size === "anchor") return null;
        const isReady = tool?.ready;
        return isReady ? (
          <motion.path
            key={p.id}
            d={`M ${centerX} ${centerY} L ${p.cx} ${p.cy}`}
            stroke={tool!.glowColor.replace("0.55", "0.45")}
            strokeWidth="1.2"
            fill="none"
            filter="url(#glow-line)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.85 }}
            transition={{ duration: 1.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        ) : (
          <line
            key={p.id}
            x1={centerX}
            y1={centerY}
            x2={p.cx}
            y2={p.cy}
            stroke="rgba(250,250,250,0.045)"
            strokeWidth="0.8"
            strokeDasharray="2 9"
          />
        );
      })}
    </svg>
  );
}

function CategoryLabel({
  label,
  x,
  y,
}: {
  label: string;
  x: number;
  y: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 2,
        padding: "3px 9px",
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.075)",
        borderRadius: "999px",
        fontSize: "0.6rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "rgba(250,250,250,0.28)",
        whiteSpace: "nowrap",
        backdropFilter: "blur(4px)",
      }}
    >
      {label}
    </div>
  );
}

function AmbientParticles() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: (i * 79 + 31) % 100,
        y: (i * 53 + 17) % 100,
        size: 1 + (i * 7) % 3,
        dur: 12 + (i * 3) % 16,
        delay: ((i * 19) % 80) / 10,
        color:
          i % 3 === 0
            ? "rgba(99,102,241,0.3)"
            : i % 3 === 1
            ? "rgba(59,130,246,0.25)"
            : "rgba(180,160,255,0.2)",
      })),
    []
  );

  if (!mounted) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
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
            background: p.color,
          }}
          animate={{ y: [0, -32, 0], opacity: [0, 0.55, 0] }}
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
    const shortSide = Math.min(dims.w, dims.h);
    const scale = (shortSide * 0.43) / 70;

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

    const categoryAngles: Record<string, number[]> = {};
    TOOLS.forEach((t) => {
      if (t.size === "anchor") return;
      if (!categoryAngles[t.category]) categoryAngles[t.category] = [];
      categoryAngles[t.category].push(t.angle);
    });

    const CAT_LABELS: Record<string, string> = {
      "ai-chat": "AI Chat",
      "image-gen": "Image AI",
      "video-gen": "Video AI",
      "audio-gen": "Audio AI",
      productivity: "Productivity",
      dev: "Dev & ML",
    };

    const categoryLabels: { label: string; x: number; y: number }[] = [];
    Object.entries(categoryAngles).forEach(([cat, angles]) => {
      const avg = angles.reduce((a, b) => a + b, 0) / angles.length;
      const rad = (avg * Math.PI) / 180;
      const labelR = 70 * scale * 1.2;
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
        minHeight: 560,
        overflow: "hidden",
      }}
    >
      <AmbientParticles />
      <ConnectorLines
        centerX={centerX}
        centerY={centerY}
        positions={positions}
      />

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

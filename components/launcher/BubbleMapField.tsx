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
        x: ((i * 79 + 31) % 100),
        y: ((i * 53 + 17) % 100),
        size: 1 + ((i * 7) % 3),
        dur: 12 + ((i * 3) % 16),
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

// ─── Mobile card layout (<640px) ─────────────────────────────────────────────────
function MobileBubbleMap({ onToolClick }: { onToolClick: (tool: Tool) => void }) {
  const anchor = TOOLS.find((t) => t.size === "anchor");
  const ready = TOOLS.filter((t) => t.ready && t.size !== "anchor");
  const coming = TOOLS.filter((t) => !t.ready);

  const CardItem = ({ tool, i }: { tool: Tool; i: number }) => (
    <motion.button
      key={tool.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onToolClick(tool)}
      aria-label={tool.name}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        background: tool.ready ? tool.color : "rgba(255,255,255,0.03)",
        border: `1px solid ${ tool.ready ? tool.glowColor.replace("0.55","0.35").replace("0.3","0.25") : "rgba(255,255,255,0.07)" }`,
        borderRadius: 12,
        cursor: "pointer",
        textAlign: "left",
        boxShadow: tool.ready ? `0 0 12px ${tool.glowColor.replace("0.55","0.2").replace("0.3","0.15")}` : "none",
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        background: tool.ready ? tool.glowColor.replace("0.55","0.18").replace("0.3","0.14") : "rgba(255,255,255,0.05)",
        border: `1px solid ${ tool.ready ? tool.glowColor.replace("0.55","0.3").replace("0.3","0.22") : "rgba(255,255,255,0.09)" }`,
        flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: "0.6rem", fontWeight: 700, color: tool.ready ? tool.textColor : "rgba(250,250,250,0.25)", letterSpacing: "0.04em" }}>
          {tool.name.slice(0,2).toUpperCase()}
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "0.8rem", fontWeight: 600, color: tool.ready ? tool.textColor : "rgba(250,250,250,0.3)", marginBottom: 1 }}>{tool.name}</p>
        {tool.tagline && <p style={{ fontSize: "0.65rem", color: tool.ready ? tool.textColor.replace(")",", 0.6)").replace("rgb","rgba") : "rgba(250,250,250,0.18)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tool.tagline}</p>}
      </div>
      {tool.ready
        ? <span style={{ fontSize: "0.58rem", color: tool.textColor, opacity: 0.6, letterSpacing: "0.06em", textTransform: "uppercase", flexShrink: 0 }}>Ready</span>
        : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(250,250,250,0.2)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      }
    </motion.button>
  );

  return (
    <div style={{ overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Anchor */}
      {anchor && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onToolClick(anchor)}
          style={{
            padding: "18px 20px",
            background: anchor.color,
            border: `1.5px solid ${anchor.glowColor.replace("0.55","0.5").replace("0.3","0.35")}`,
            borderRadius: 18,
            cursor: "pointer",
            textAlign: "center",
            boxShadow: `0 0 32px ${anchor.glowColor.replace("0.55","0.3").replace("0.3","0.22")}`,
          }}
        >
          <p style={{ fontSize: "1.1rem", fontWeight: 700, color: anchor.textColor, letterSpacing: "-0.01em", marginBottom: 4 }}>{anchor.name}</p>
          {anchor.tagline && <p style={{ fontSize: "0.75rem", color: anchor.textColor, opacity: 0.65 }}>{anchor.tagline}</p>}
        </motion.button>
      )}

      {/* Ready tools */}
      {ready.length > 0 && (
        <div>
          <p style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(250,250,250,0.28)", marginBottom: 8, paddingLeft: 2 }}>Ready to explore</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ready.map((t, i) => <CardItem key={t.id} tool={t} i={i} />)}
          </div>
        </div>
      )}

      {/* Coming soon */}
      {coming.length > 0 && (
        <div>
          <p style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(250,250,250,0.18)", marginBottom: 8, paddingLeft: 2 }}>Coming soon</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {coming.map((t, i) => <CardItem key={t.id} tool={t} i={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BubbleMapField({ onToolClick }: BubbleMapFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 1200, h: 700 });
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

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
        setIsMobile(r.width < 640);
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
        return { id: tool.id, cx, cy, x: cx - SIZE_MAP.anchor / 2, y: cy - SIZE_MAP.anchor / 2, ready: tool.ready };
      }
      const angleRad = (tool.angle * Math.PI) / 180;
      const r = tool.radius * scale;
      const px = cx + Math.cos(angleRad) * r;
      const py = cy + Math.sin(angleRad) * r;
      return { id: tool.id, cx: px, cy: py, x: px - SIZE_MAP[tool.size] / 2, y: py - SIZE_MAP[tool.size] / 2, ready: tool.ready };
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
      categoryLabels.push({ label: CAT_LABELS[cat] ?? cat, x: cx + Math.cos(rad) * labelR, y: cy + Math.sin(rad) * labelR });
    });

    return { positions, centerX: cx, centerY: cy, categoryLabels };
  }, [dims]);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "100%", minHeight: 560, overflow: "hidden" }}
    >
      {isMobile ? (
        <MobileBubbleMap onToolClick={onToolClick} />
      ) : (
        <>
          <AmbientParticles />
          <Connecto
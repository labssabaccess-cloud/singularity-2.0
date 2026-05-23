"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Tool, BubbleSize } from "@/lib/tools";

const SIZE_MAP: Record<BubbleSize, number> = {
  anchor: 130,
  large:  100,
  medium:  78,
  small:   58,
};

interface BubbleNodeProps {
  tool: Tool;
  style?: React.CSSProperties;
  onClick: (tool: Tool) => void;
  index: number;
}

export default function BubbleNode({ tool, style, onClick, index }: BubbleNodeProps) {
  const [hovered, setHovered] = useState(false);
  const diameter = SIZE_MAP[tool.size];

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`${tool.name}${ tool.ready ? "" : " (in development)" }`}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: 0.06 * index,
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ scale: tool.ready ? 1.14 : 1.07 }}
      whileTap={{ scale: 0.96 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(tool); }}
      onClick={() => onClick(tool)}
      style={{
        width:    diameter,
        height:   diameter,
        borderRadius: "50%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        cursor: "pointer",
        position: "absolute",
        background: tool.color,
        border: `1px solid ${
          tool.ready
            ? `${ tool.glowColor.replace("0.55", "0.35") }`
            : "rgba(250,250,250,0.06)"
        }`,
        boxShadow: hovered && tool.ready
          ? `0 0 32px ${tool.glowColor}, 0 0 64px ${tool.glowColor.replace("0.55", "0.18")}, inset 0 1px 0 rgba(255,255,255,0.08)`
          : tool.ready
          ? `0 0 14px ${tool.glowColor.replace("0.55", "0.22")}, inset 0 1px 0 rgba(255,255,255,0.05)`
          : "none",
        backdropFilter: "blur(12px)",
        transition: "box-shadow 0.3s ease",
        userSelect: "none",
        outline: "none",
        ...style,
      }}
    >
      {/* Pulse ring for ready nodes */}
      {tool.ready && (
        <motion.div
          style={{
            position: "absolute",
            inset: -6,
            borderRadius: "50%",
            border: `1.5px solid ${tool.glowColor.replace("0.55", "0.35")}`  ,
            pointerEvents: "none",
          }}
          animate={{ scale: [1, 1.18, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Label */}
      <span
        style={{
          fontSize: tool.size === "anchor" ? "11px" : tool.size === "large" ? "10px" : "9px",
          fontWeight: 600,
          letterSpacing: "0.04em",
          textAlign: "center",
          lineHeight: 1.25,
          color: tool.ready ? tool.textColor : "rgba(250,250,250,0.32)",
          paddingInline: "8px",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        {tool.name}
      </span>

      {/* Ready badge */}
      {tool.ready && (
        <span
          style={{
            fontSize: "7px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: tool.textColor,
            opacity: 0.75,
            pointerEvents: "none",
          }}
        >
          LIVE
        </span>
      )}

      {/* Lock icon for dev */}
      {!tool.ready && (
        <svg
          width="10" height="10"
          viewBox="0 0 24 24"
          fill="rgba(250,250,250,0.22)"
          style={{ pointerEvents: "none" }}
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="rgba(250,250,250,0.22)" strokeWidth="2" />
        </svg>
      )}
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import type { Tool } from "@/lib/tools";

const SIZE_MAP = { anchor: 130, large: 105, medium: 82, small: 62 } as const;

interface BubbleNodeProps {
  tool: Tool;
  index: number;
  style: { left: number; top: number };
  onClick: (tool: Tool) => void;
  completed?: boolean;
}

export default function BubbleNode({ tool, index, style, onClick, completed = false }: BubbleNodeProps) {
  const size = SIZE_MAP[tool.size];
  const isReady = tool.ready;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.04,
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(tool)}
      aria-label={`${tool.name}${!isReady ? " — in development" : ""}`}
      style={{
        position: "absolute",
        left: style.left,
        top: style.top,
        width: size,
        height: size,
        borderRadius: "50%",
        background: completed
          ? tool.color.replace(/[\d.]+\)$/, "0.28)")
          : tool.color,
        border: `1.5px solid ${
          completed
            ? tool.glowColor.replace("0.55", "0.7").replace("0.3", "0.55")
            : isReady
            ? tool.glowColor.replace("0.55", "0.45").replace("0.3", "0.3")
            : "rgba(255,255,255,0.07)"
        }`,
        boxShadow: completed
          ? `0 0 24px ${tool.glowColor.replace("0.55", "0.35").replace("0.3", "0.25")}, 0 0 48px ${tool.glowColor.replace("0.55", "0.15").replace("0.3", "0.1")}`
          : isReady
          ? `0 0 18px ${tool.glowColor.replace("0.55", "0.25").replace("0.3", "0.18")}`
          : "none",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        padding: "8px",
        zIndex: tool.size === "anchor" ? 10 : 5,
        overflow: "hidden",
      }}
    >
      {/* Pulse ring for ready/completed bubbles */}
      {(isReady || completed) && (
        <motion.div
          animate={{
            scale: [1, 1.6],
            opacity: [0.35, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeOut",
            delay: index * 0.15,
          }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `1px solid ${tool.glowColor.replace("0.55", "0.5").replace("0.3", "0.35")}`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Completed checkmark badge */}
      {completed && (
        <div
          style={{
            position: "absolute",
            top: size > 80 ? 8 : 4,
            right: size > 80 ? 8 : 4,
            width: size > 80 ? 18 : 14,
            height: size > 80 ? 18 : 14,
            borderRadius: "50%",
            background: tool.glowColor.replace("0.55", "0.8").replace("0.3", "0.7"),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
            <polyline points="1.5,5 4,7.5 8.5,2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {/* Lock icon for in-dev */}
      {!isReady && (
        <div
          style={{
            position: "absolute",
            top: size > 80 ? 8 : 4,
            right: size > 80 ? 8 : 4,
            opacity: 0.4,
          }}
        >
          <svg width={size > 80 ? 12 : 9} height={size > 80 ? 12 : 9} viewBox="0 0 24 24" fill="none" stroke="rgba(250,250,250,0.6)" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
      )}

      <span
        style={{
          fontSize: tool.size === "anchor" ? "0.75rem" : tool.size === "large" ? "0.7rem" : tool.size === "medium" ? "0.65rem" : "0.58rem",
          fontWeight: 600,
          color: isReady ? tool.textColor : "rgba(250,250,250,0.38)",
          textAlign: "center",
          lineHeight: 1.2,
          letterSpacing: "0.02em",
          maxWidth: size - 16,
          wordBreak: "break-word",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        {tool.name}
      </span>

      {tool.size !== "small" && (
        <span
          style={{
            fontSize: "0.52rem",
            color: "rgba(250,250,250,0.22)",
            textAlign: "center",
            lineHeight: 1.2,
            maxWidth: size - 20,
            letterSpacing: "0.03em",
            pointerEvents: "none",
          }}
        >
          {isReady ? "Ready" : "Soon"}
        </span>
      )}
    </motion.button>
  );
}

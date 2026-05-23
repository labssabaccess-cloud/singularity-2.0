"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Tool } from "@/lib/tools";

const SIZE_MAP = { anchor: 134, large: 108, medium: 84, small: 64 } as const;

interface BubbleNodeProps {
  tool: Tool;
  index: number;
  style: { left: number; top: number };
  onClick: (tool: Tool) => void;
  completed?: boolean;
}

export default function BubbleNode({
  tool,
  index,
  style,
  onClick,
  completed = false,
}: BubbleNodeProps) {
  const size = SIZE_MAP[tool.size];
  const isReady = tool.ready;
  const [hovered, setHovered] = useState(false);

  const nameFontSize =
    tool.size === "anchor"
      ? tool.name.length > 14
        ? "0.63rem"
        : "0.73rem"
      : tool.size === "large"
      ? "0.7rem"
      : tool.size === "medium"
      ? "0.65rem"
      : "0.58rem";

  const bg = completed
    ? tool.color.replace(/[\d.]+\)$/, "0.32)")
    : isReady
    ? tool.color
    : tool.color.replace(/[\d.]+\)$/, "0.07)");

  const borderColor = completed
    ? tool.glowColor.replace("0.55", "0.75").replace("0.3", "0.6")
    : isReady
    ? tool.glowColor.replace("0.55", "0.48").replace("0.3", "0.32")
    : "rgba(255,255,255,0.09)";

  const shadow = completed
    ? `0 0 28px ${tool.glowColor.replace("0.55", "0.4").replace("0.3", "0.28")}, 0 0 56px ${tool.glowColor.replace("0.55", "0.18").replace("0.3", "0.12")}`
    : isReady
    ? `0 0 20px ${tool.glowColor.replace("0.55", "0.28").replace("0.3", "0.2")}, 0 4px 16px rgba(0,0,0,0.25)`
    : "0 2px 8px rgba(0,0,0,0.18)";

  return (
    <div
      style={{
        position: "absolute",
        left: style.left,
        top: style.top,
        width: size,
        height: size,
        zIndex: tool.size === "anchor" ? 10 : 5,
      }}
    >
      <motion.button
        initial={{ opacity: 0, scale: 0.55 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: index * 0.04,
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1],
        }}
        whileHover={{ scale: 1.11, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } }}
        whileTap={{ scale: 0.94 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={() => onClick(tool)}
        aria-label={`${tool.name}${!isReady ? " — in development" : ""}`}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: bg,
          border: `1.5px solid ${borderColor}`,
          boxShadow: shadow,
          backdropFilter: isReady ? "blur(4px)" : "none",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "3px",
          padding: "8px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Soft inner radial for ready bubbles */}
        {isReady && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: `radial-gradient(circle at 38% 32%, ${tool.glowColor
                .replace("0.55", "0.14")
                .replace("0.3", "0.1")} 0%, transparent 68%)`,
              pointerEvents: "none",
            }}
          />
        )}

        {/* Pulse ring for ready / completed */}
        {(isReady || completed) && (
          <motion.div
            animate={{ scale: [1, 1.65], opacity: [0.3, 0] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeOut",
              delay: index * 0.18,
            }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `1px solid ${tool.glowColor
                .replace("0.55", "0.45")
                .replace("0.3", "0.3")}`,
              pointerEvents: "none",
            }}
          />
        )}

        {/* Completed check badge */}
        {completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: "absolute",
              top: size > 80 ? 9 : 5,
              right: size > 80 ? 9 : 5,
              width: size > 80 ? 18 : 14,
              height: size > 80 ? 18 : 14,
              borderRadius: "50%",
              background: tool.glowColor
                .replace("0.55", "0.85")
                .replace("0.3", "0.75"),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
              <polyline
                points="1.5,5 4,7.5 8.5,2"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        )}

        {/* Lock icon for in-dev */}
        {!isReady && (
          <div
            style={{
              position: "absolute",
              top: size > 80 ? 9 : 5,
              right: size > 80 ? 9 : 5,
              opacity: 0.35,
            }}
          >
            <svg
              width={size > 80 ? 11 : 8}
              height={size > 80 ? 11 : 8}
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(250,250,250,0.7)"
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        )}

        {/* Name */}
        <span
          style={{
            fontSize: nameFontSize,
            fontWeight: 700,
            color: isReady ? tool.textColor : "rgba(250,250,250,0.3)",
            textAlign: "center",
            lineHeight: 1.2,
            letterSpacing: "0.02em",
            maxWidth: size - 18,
            wordBreak: "break-word",
            pointerEvents: "none",
            zIndex: 1,
            transition: "color 0.18s",
          }}
        >
          {tool.name}
        </span>

        {/* Status label */}
        {tool.size !== "small" && (
          <span
            style={{
              fontSize: "0.52rem",
              color: isReady
                ? "rgba(255,255,255,0.45)"
                : "rgba(250,250,250,0.18)",
              textAlign: "center",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            {completed ? "Explored" : isReady ? "Ready" : "Soon"}
          </span>
        )}
      </motion.button>

      {/* Tagline tooltip on hover */}
      <AnimatePresence>
        {hovered && tool.tagline && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              bottom: "calc(100% + 8px)",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(14,14,22,0.94)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              padding: "6px 11px",
              whiteSpace: "nowrap",
              fontSize: "0.68rem",
              color: "rgba(250,250,250,0.75)",
              pointerEvents: "none",
              zIndex: 50,
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              maxWidth: 200,
              textAlign: "center",
            }}
          >
            {tool.tagline}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

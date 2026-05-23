"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Tool } from "@/lib/tools";
import { X } from "lucide-react";

interface InDevModalProps {
  tool: Tool | null;
  onClose: () => void;
}

export default function InDevModal({ tool, onClose }: InDevModalProps) {
  if (!tool) return null;

  return (
    <AnimatePresence>
      {tool && (
        <motion.div
          key="indev-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: "20px",
          }}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 16 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(12,12,22,0.97)",
              border: `1px solid rgba(255,255,255,0.09)`,
              borderRadius: "24px",
              padding: "40px 36px 32px",
              maxWidth: "440px",
              width: "100%",
              position: "relative",
              backdropFilter: "blur(24px)",
              boxShadow: `0 0 80px ${tool.glowColor.replace("0.55", "0.08").replace("0.3", "0.06")}, 0 32px 64px rgba(0,0,0,0.5)`,
            }}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "rgba(250,250,250,0.5)",
              }}
            >
              <X size={14} />
            </button>

            {/* Glow orb */}
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: tool.color,
                border: `1.5px solid ${tool.glowColor.replace("0.55", "0.4").replace("0.3", "0.3")}`,
                boxShadow: `0 0 32px ${tool.glowColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: tool.textColor,
                }}
              >
                AI
              </span>
            </motion.div>

            <h2
              style={{
                fontSize: "1.35rem",
                fontWeight: 600,
                color: "#FAFAFA",
                marginBottom: "6px",
                letterSpacing: "-0.01em",
              }}
            >
              {tool.name}
            </h2>

            {tool.tagline && (
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "rgba(250,250,250,0.4)",
                  marginBottom: "18px",
                  lineHeight: 1.5,
                }}
              >
                {tool.tagline}
              </p>
            )}

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "6px 14px",
                background: "rgba(255,200,50,0.07)",
                border: "1px solid rgba(255,200,50,0.18)",
                borderRadius: "999px",
                marginBottom: "22px",
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "rgba(255,200,50,0.8)",
                }}
              />
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,200,50,0.75)",
                }}
              >
                In Development
              </span>
            </div>

            <p
              style={{
                fontSize: "0.87rem",
                color: "rgba(250,250,250,0.45)",
                lineHeight: 1.65,
                marginBottom: "28px",
              }}
            >
              A full Singularity experience for{" "}
              <strong style={{ color: "rgba(250,250,250,0.8)" }}>
                {tool.name}
              </strong>{" "}
              is currently being crafted. Check back soon — it’ll be worth the
              wait.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSd-placeholder/viewform"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  padding: "12px 20px",
                  background: tool.color,
                  border: `1px solid ${tool.glowColor
                    .replace("0.55", "0.4")
                    .replace("0.3", "0.3")}`,
                  borderRadius: "14px",
                  color: tool.textColor,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textAlign: "center",
                  cursor: "pointer",
                  textDecoration: "none",
                }}
              >
                Join the waitlist →
              </a>

              <button
                onClick={onClose}
                style={{
                  padding: "11px 20px",
                  background: "transparent",
                  border: "1px solid rgba(250,250,250,0.09)",
                  borderRadius: "14px",
                  color: "rgba(250,250,250,0.4)",
                  fontSize: "0.84rem",
                  cursor: "pointer",
                }}
              >
                Back to map
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

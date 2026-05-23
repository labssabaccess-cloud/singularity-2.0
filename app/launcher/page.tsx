"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { Tool } from "@/lib/tools";
import WelcomeModal from "@/components/launcher/WelcomeModal";
import InDevModal from "@/components/launcher/InDevModal";
import FeedbackSection from "@/components/launcher/FeedbackSection";

// Lazy-load heavy bubble map to avoid SSR issues
const BubbleMapField = dynamic(() => import("@/components/launcher/BubbleMapField"), { ssr: false });

const WELCOME_KEY = "sg_welcome_seen";

export default function LauncherPage() {
  const router = useRouter();
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [devTool, setDevTool] = useState<Tool | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    // Staggered entrance
    const t = setTimeout(() => setEntered(true), 80);

    // Show welcome modal on first visit (in-memory, no localStorage)
    const seen = sessionStorage.getItem(WELCOME_KEY);
    if (!seen) {
      setWelcomeOpen(true);
      sessionStorage.setItem(WELCOME_KEY, "1");
    }
    return () => clearTimeout(t);
  }, []);

  const handleToolClick = (tool: Tool) => {
    if (tool.ready) {
      router.push(`/singularity/${tool.id}`);
    } else {
      setDevTool(tool);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Ambient bg */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 55% at 50% 40%, rgba(29,78,216,0.09) 0%, rgba(88,28,135,0.04) 45%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : -16 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 32px",
          borderBottom: "1px solid rgba(250,250,250,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                border: "1.5px solid rgba(99,102,241,0.7)",
                borderTopColor: "transparent",
              }}
            />
          </div>
          <span
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#FAFAFA",
              fontFamily: "'SF Mono', 'Fira Code', monospace",
            }}
          >
            Singularity
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => setWelcomeOpen(true)}
            style={{
              padding: "7px 14px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: "8px",
              color: "rgba(250,250,250,0.5)",
              fontSize: "0.78rem",
              cursor: "pointer",
              letterSpacing: "0.06em",
            }}
          >
            How it works
          </button>
        </div>
      </motion.header>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : 20 }}
        transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          textAlign: "center",
          padding: "32px 20px 16px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <h1
          style={{
            fontSize: "clamp(1.4rem, 3vw, 2rem)",
            fontWeight: 700,
            color: "#FAFAFA",
            letterSpacing: "-0.02em",
            marginBottom: "8px",
          }}
        >
          The AI Landscape
        </h1>
        <p
          style={{
            fontSize: "0.9rem",
            color: "rgba(250,250,250,0.4)",
            maxWidth: "400px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          An interactive map of AI tools — explore, learn, and build real intuition.
        </p>

        {/* Legend */}
        <div
          style={{
            display: "inline-flex",
            gap: "20px",
            marginTop: "16px",
            padding: "8px 16px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <motion.div
              animate={{ boxShadow: ["0 0 6px rgba(99,102,241,0.4)", "0 0 14px rgba(99,102,241,0.7)", "0 0 6px rgba(99,102,241,0.4)"] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(99,102,241,0.8)" }}
            />
            <span style={{ fontSize: "0.72rem", color: "rgba(250,250,250,0.45)", letterSpacing: "0.05em" }}>Ready</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(250,250,250,0.15)" }} />
            <span style={{ fontSize: "0.72rem", color: "rgba(250,250,250,0.45)", letterSpacing: "0.05em" }}>In development</span>
          </div>
        </div>
      </motion.div>

      {/* Bubble map */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: entered ? 1 : 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        style={{
          flex: 1,
          position: "relative",
          zIndex: 5,
          minHeight: 520,
        }}
      >
        <BubbleMapField onToolClick={handleToolClick} />
      </motion.div>

      {/* Feedback */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: entered ? 1 : 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        style={{ position: "relative", zIndex: 10 }}
      >
        <FeedbackSection />
      </motion.div>

      {/* Modals */}
      <WelcomeModal open={welcomeOpen} onClose={() => setWelcomeOpen(false)} />
      <InDevModal tool={devTool} onClose={() => setDevTool(null)} />
    </div>
  );
}

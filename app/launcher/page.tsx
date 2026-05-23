"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { Tool } from "@/lib/tools";
import { TOOLS } from "@/lib/tools";
import { getCompleted } from "@/lib/progress";
import WelcomeModal from "@/components/launcher/WelcomeModal";
import InDevModal from "@/components/launcher/InDevModal";
import FeedbackSection from "@/components/launcher/FeedbackSection";

const BubbleMapField = dynamic(() => import("@/components/launcher/BubbleMapField"), { ssr: false });

const WELCOME_KEY = "sg_welcome_seen";
const READY_COUNT = TOOLS.filter((t) => t.ready).length;
const TOTAL_COUNT = TOOLS.length;

export default function LauncherPage() {
  const router = useRouter();
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [devTool, setDevTool] = useState<Tool | null>(null);
  const [entered, setEntered] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    const seen = sessionStorage.getItem(WELCOME_KEY);
    if (!seen) {
      setWelcomeOpen(true);
      sessionStorage.setItem(WELCOME_KEY, "1");
    }
    // Load progress
    setCompletedCount(getCompleted().size);
    const handler = () => setCompletedCount(getCompleted().size);
    window.addEventListener("sg_progress", handler);
    return () => {
      clearTimeout(t);
      window.removeEventListener("sg_progress", handler);
    };
  }, []);

  const handleToolClick = (tool: Tool) => {
    if (tool.ready) {
      router.push(`/singularity/${tool.id}`);
    } else {
      setDevTool(tool);
    }
  };

  const progressPct = Math.round((completedCount / READY_COUNT) * 100);

  return (
    <div
      style={{
        height: "100vh",
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
            "radial-gradient(ellipse 75% 60% at 50% 45%, rgba(29,78,216,0.1) 0%, rgba(88,28,135,0.05) 45%, transparent 72%)",
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
          padding: "16px 32px",
          borderBottom: "1px solid rgba(250,250,250,0.05)",
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: 30,
              height: 30,
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
                width: 9,
                height: 9,
                borderRadius: "50%",
                border: "1.5px solid rgba(99,102,241,0.7)",
                borderTopColor: "transparent",
              }}
            />
          </div>
          <span
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#FAFAFA",
              fontFamily: "'SF Mono','Fira Code',monospace",
            }}
          >
            Singularity
          </span>
        </div>

        {/* Progress bar + controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Progress */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.72rem", color: "rgba(250,250,250,0.35)", letterSpacing: "0.06em" }}>
              {completedCount}/{READY_COUNT} explored
            </span>
            <div
              style={{
                width: 80,
                height: 3,
                background: "rgba(255,255,255,0.08)",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <motion.div
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, rgba(99,102,241,0.8), rgba(59,130,246,0.8))",
                  borderRadius: "999px",
                }}
              />
            </div>
          </div>

          <button
            onClick={() => setWelcomeOpen(true)}
            style={{
              padding: "6px 13px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: "8px",
              color: "rgba(250,250,250,0.45)",
              fontSize: "0.75rem",
              cursor: "pointer",
              letterSpacing: "0.05em",
            }}
          >
            How it works
          </button>
        </div>
      </motion.header>

      {/* Title strip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : 16 }}
        transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 32px 10px",
          position: "relative",
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "clamp(1.1rem, 2.2vw, 1.5rem)",
              fontWeight: 700,
              color: "#FAFAFA",
              letterSpacing: "-0.02em",
              marginBottom: "3px",
            }}
          >
            The AI Landscape
          </h1>
          <p style={{ fontSize: "0.78rem", color: "rgba(250,250,250,0.35)", lineHeight: 1.5 }}>
            {TOTAL_COUNT} tools · explore, learn, build real intuition
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <motion.div
              animate={{ boxShadow: ["0 0 5px rgba(99,102,241,0.4)", "0 0 12px rgba(99,102,241,0.7)", "0 0 5px rgba(99,102,241,0.4)"] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(99,102,241,0.85)" }}
            />
            <span style={{ fontSize: "0.68rem", color: "rgba(250,250,250,0.38)", letterSpacing: "0.04em" }}>Ready</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(250,250,250,0.15)" }} />
            <span style={{ fontSize: "0.68rem", color: "rgba(250,250,250,0.38)", letterSpacing: "0.04em" }}>Coming soon</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(99,241,120,0.7)", border: "1px solid rgba(99,241,120,0.9)" }} />
            <span style={{ fontSize: "0.68rem", color: "rgba(250,250,250,0.38)", letterSpacing: "0.04em" }}>Completed</span>
          </div>
        </div>
      </motion.div>

      {/* Bubble map — takes all remaining height */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: entered ? 1 : 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        style={{
          flex: 1,
          position: "relative",
          zIndex: 5,
          minHeight: 0,
        }}
      >
        <BubbleMapField onToolClick={handleToolClick} />
      </motion.div>

      {/* Feedback */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: entered ? 1 : 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        style={{ position: "relative", zIndex: 10, flexShrink: 0 }}
      >
        <FeedbackSection />
      </motion.div>

      <WelcomeModal open={welcomeOpen} onClose={() => setWelcomeOpen(false)} />
      <InDevModal tool={devTool} onClose={() => setDevTool(null)} />
    </div>
  );
}

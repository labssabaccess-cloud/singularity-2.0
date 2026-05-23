"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import CinematicIntro from "./CinematicIntro";

const INIT_TEXT = "Initializing AI Workspace...";

function TypewriterText({ onComplete }: { onComplete: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const typeNext = () => {
      if (indexRef.current < INIT_TEXT.length) {
        setDisplayed(INIT_TEXT.slice(0, indexRef.current + 1));
        indexRef.current += 1;
        timerRef.current = setTimeout(typeNext, 35);
      } else {
        setTimeout(onComplete, 700);
      }
    };
    timerRef.current = setTimeout(typeNext, 400);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [onComplete]);

  return (
    <span>
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.7, repeat: Infinity }}
        style={{
          display: "inline-block",
          width: "2px",
          height: "1.1em",
          background: "#FAFAFA",
          marginLeft: "3px",
          verticalAlign: "middle",
        }}
      />
    </span>
  );
}

// Hydration-safe: cell animation delays are stable (seeded by index, not Math.random on server)
function GeometricGrid() {
  // Generate stable delay seeds only on client to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cols = 14;
  const rows = 9;
  const cells = Array.from({ length: cols * rows }, (_, i) => i);

  // Deterministic pseudo-random using index as seed
  const cellDelays = useMemo(() =>
    cells.map((i) => ((i * 37 + 13) % 200) / 100), // 0 to 2s range
  []);

  const accentData = useMemo(() => [
    { left: 15, top: 10, size: 40, shape: "square" },
    { left: 32, top: 28, size: 50, shape: "circle" },
    { left: 49, top: 46, size: 60, shape: "square" },
    { left: 66, top: 64, size: 70, shape: "circle" },
    { left: 83, top: 82, size: 80, shape: "square" },
  ], []);

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        pointerEvents: "none",
      }}
    >
      {cells.map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.12, 0.04, 0.14, 0.06] }}
          transition={{
            duration: 4,
            delay: cellDelays[i],
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.25, 0.5, 0.75, 1],
          }}
          style={{ border: "1px solid rgba(250, 250, 250, 0.08)", background: "transparent" }}
        />
      ))}

      {accentData.map((a, i) => (
        <motion.div
          key={`accent-${i}`}
          style={{
            position: "absolute",
            left: `${a.left}%`,
            top: `${a.top}%`,
            width: `${a.size}px`,
            height: `${a.size}px`,
            border: "1px solid rgba(120, 180, 255, 0.18)",
            borderRadius: a.shape === "circle" ? "50%" : "0",
            pointerEvents: "none",
          }}
          animate={{
            rotate: [0, 90, 180, 270, 360],
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.06, 1],
          }}
          transition={{
            rotate: { duration: 12 + i * 3, repeat: Infinity, ease: "linear" },
            opacity: { duration: 3 + i, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 4 + i, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      ))}

      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(60,100,200,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

type Stage = "typing" | "grid" | "button" | "cinematic";

export default function Onboarding() {
  const [stage, setStage] = useState<Stage>("typing");
  const [exiting, setExiting] = useState(false);
  const router = useRouter();

  const handleTypingComplete = () => {
    setStage("grid");
    setTimeout(() => setStage("button"), 1200);
  };

  const handleInitialize = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => setStage("cinematic"), 900);
  };

  const handleCinematicComplete = () => {
    router.push("/launcher"); // Routes to launcher, not /workspace
  };

  if (stage === "cinematic") {
    return <CinematicIntro onComplete={handleCinematicComplete} />;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0A0A0A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <AnimatePresence>
        {(stage === "grid" || stage === "button") && (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: exiting ? 0 : 1 }}
            transition={{ duration: exiting ? 0.6 : 0.8 }}
            style={{ position: "absolute", inset: 0 }}
          >
            <GeometricGrid />
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ position: "relative", zIndex: 10, textAlign: "center" }}>
        <AnimatePresence mode="wait">
          {stage === "typing" && (
            <motion.div
              key="typing"
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.5, ease: "easeIn" }}
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
                fontWeight: 300,
                letterSpacing: "0.08em",
                color: "#FAFAFA",
                fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
              }}
            >
              <TypewriterText onComplete={handleTypingComplete} />
            </motion.div>
          )}

          {stage === "button" && (
            <motion.div
              key="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: exiting ? 0 : 1, y: exiting ? -20 : 0 }}
              transition={{ duration: exiting ? 0.5 : 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: exiting ? 0 : 0.5 }}
                transition={{ delay: exiting ? 0 : 0.3, duration: 0.8 }}
                style={{
                  fontSize: "0.85rem",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "#FAFAFA",
                  fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
                }}
              >
                System Ready
              </motion.p>

              <motion.button
                onClick={handleInitialize}
                whileHover={{ scale: exiting ? 1 : 1.03 }}
                whileTap={{ scale: exiting ? 1 : 0.97 }}
                disabled={exiting}
                style={{
                  position: "relative",
                  padding: "1rem 2.5rem",
                  background: "transparent",
                  border: "1px solid rgba(250, 250, 250, 0.3)",
                  color: "#FAFAFA",
                  fontSize: "0.9rem",
                  fontWeight: 400,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  cursor: exiting ? "default" : "pointer",
                  fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <motion.span
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(ellipse 80% 80% at 50% 120%, rgba(100, 160, 255, 0.15) 0%, transparent 70%)",
                    pointerEvents: "none",
                  }}
                  animate={{ opacity: exiting ? 0 : [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: exiting ? 0 : Infinity, ease: "easeInOut" }}
                />
                <motion.span
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "1px",
                    background:
                      "linear-gradient(90deg, transparent, rgba(120, 180, 255, 0.8), transparent)",
                    pointerEvents: "none",
                  }}
                  animate={
                    exiting
                      ? { opacity: 0 }
                      : { scaleX: [0, 1, 0], x: ["-100%", "0%", "100%"] }
                  }
                  transition={{ duration: 2.5, repeat: exiting ? 0 : Infinity, ease: "easeInOut" }}
                />
                <span style={{ position: "relative", zIndex: 1 }}>
                  {exiting ? "Entering..." : "Initialize Reality"}
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {exiting && (
          <motion.div
            key="exit-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeIn" }}
            style={{
              position: "absolute",
              inset: 0,
              background: "#0A0A0A",
              zIndex: 50,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

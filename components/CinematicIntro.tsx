"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";

type Phase = "logo-drop" | "logo-hold" | "logo-fade" | "video" | "shrinking" | "done";

interface CinematicIntroProps {
  videoSrc?: string;
  onComplete: () => void;
}

function FloatingAccent({ x, y, size, index }: { x: number; y: number; size: number; index: number }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        border: "1px solid rgba(74,139,255,0.14)",
        borderRadius: index % 2 === 0 ? "0" : "50%",
        pointerEvents: "none",
      }}
      animate={{
        rotate: [0, 360],
        opacity: [0.3, 0.7, 0.3],
        scale: [1, 1.08, 1],
      }}
      transition={{
        rotate: { duration: 14 + index * 4, repeat: Infinity, ease: "linear" },
        opacity: { duration: 3 + index, repeat: Infinity, ease: "easeInOut" },
        scale: { duration: 5 + index, repeat: Infinity, ease: "easeInOut" },
      }}
    />
  );
}

function Scanlines() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
        zIndex: 5,
      }}
    />
  );
}

export default function CinematicIntro({ videoSrc, onComplete }: CinematicIntroProps) {
  const [phase, setPhase] = useState<Phase>("logo-drop");
  const videoRef = useRef<HTMLVideoElement>(null);

  const panelX       = useMotionValue(0);
  const panelY       = useMotionValue(0);
  const panelScaleX  = useMotionValue(1);
  const panelScaleY  = useMotionValue(1);
  const panelOpacity = useMotionValue(1);

  const springX      = useSpring(panelX,       { stiffness: 280, damping: 32 });
  const springY      = useSpring(panelY,       { stiffness: 280, damping: 32 });
  const springScaleX = useSpring(panelScaleX,  { stiffness: 280, damping: 32 });
  const springScaleY = useSpring(panelScaleY,  { stiffness: 280, damping: 32 });
  const springOpacity = useSpring(panelOpacity, { stiffness: 280, damping: 32 });

  useEffect(() => {
    if (phase === "logo-drop") {
      const t = setTimeout(() => setPhase("logo-hold"), 900);
      return () => clearTimeout(t);
    }
    if (phase === "logo-hold") {
      const t = setTimeout(() => setPhase("logo-fade"), 1400);
      return () => clearTimeout(t);
    }
    if (phase === "logo-fade") {
      const t = setTimeout(() => setPhase("video"), 1200);
      return () => clearTimeout(t);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "video" && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [phase]);

  const triggerShrink = useCallback(() => {
    if (phase === "shrinking" || phase === "done") return;
    setPhase("shrinking");

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const widgetW = 280;
    const widgetH = 158;
    const margin  = 20;

    const panelW = Math.min(vw * 0.78, 900);
    const panelH = panelW * (9 / 16);

    const targetX = -(vw / 2) + widgetW / 2 + margin;
    const targetY =  (vh / 2) - widgetH / 2 - margin;

    panelX.set(targetX);
    panelY.set(targetY);
    panelScaleX.set(widgetW / panelW);
    panelScaleY.set(widgetH / panelH);
    panelOpacity.set(0);

    setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 820);
  }, [phase, panelX, panelY, panelScaleX, panelScaleY, panelOpacity, onComplete]);

  if (phase === "done") return null;

  const isPreVideo = phase === "logo-drop" || phase === "logo-hold" || phase === "logo-fade";
  const isVideo    = phase === "video" || phase === "shrinking";

  return (
    <motion.div
      key="cinematic-intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      style={{
        position: "fixed",
        inset: 0,
        background: "#0A0A0A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        zIndex: 100,
      }}
    >
      <Scanlines />

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(29,78,216,0.14) 0%, rgba(88,28,135,0.05) 50%, transparent 72%)",
          pointerEvents: "none",
        }}
      />

      {([[8, 12, 44], [78, 15, 52], [5, 70, 36], [82, 72, 60], [45, 88, 28]] as [number,number,number][]).map(
        ([x, y, size], i) => (
          <FloatingAccent key={i} x={x} y={y} size={size} index={i} />
        ),
      )}

      <AnimatePresence mode="wait">
        {isPreVideo && (
          <motion.div
            key="logo-seq"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -16, transition: { duration: 0.55, ease: "easeIn" } }}
            style={{
              position: "relative",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
            <motion.div
              initial={{ y: -60, opacity: 0 }}
              animate={{
                y: phase === "logo-fade" ? -8 : 0,
                opacity: phase === "logo-fade" ? 0 : 1,
              }}
              transition={{
                y:       { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
                opacity: phase === "logo-fade"
                  ? { duration: 0.55, ease: "easeIn" }
                  : { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
              }}
              style={{
                fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
                fontSize:   "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 200,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "#FAFAFA",
              }}
            >
              SINGULARITY
            </motion.div>

            <AnimatePresence>
              {phase === "logo-fade" && (
                <motion.p
                  key="subtitle"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.45, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontSize: "0.7rem",
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: "#FAFAFA",
                    fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
                  }}
                >
                  Loading tutorial…
                </motion.p>
              )}
            </AnimatePresence>

            <motion.div
              style={{
                width: "100%",
                height: "1px",
                background:
                  "linear-gradient(90deg, transparent, rgba(74,139,255,0.7) 40%, rgba(120,100,255,0.7) 60%, transparent)",
                overflow: "hidden",
              }}
              animate={phase === "logo-fade" ? { opacity: 0 } : {}}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                style={{
                  height: "100%",
                  width: "30%",
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)",
                }}
                animate={{ x: ["-100%", "450%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isVideo && (
          <motion.div
            key="video-panel"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } }}
            style={{
              position: "absolute",
              x: springX,
              y: springY,
              scaleX: springScaleX,
              scaleY: springScaleY,
              opacity: springOpacity,
              width: "min(78vw, 900px)",
              aspectRatio: "16 / 9",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow:
                "0 0 0 1px rgba(74,139,255,0.2), 0 32px 80px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.06)",
              zIndex: 20,
              transformOrigin: "center center",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                insetInline: "0",
                height: "36px",
                background: "rgba(10,10,10,0.75)",
                backdropFilter: "blur(12px)",
                borderBottom: "1px solid rgba(74,139,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingInline: "12px",
                zIndex: 30,
              }}
            >
              <span
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(74,139,255,0.7)",
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                }}
              >
                Singularity · Tutorial
              </span>
              <div style={{ display: "flex", gap: "6px" }}>
                {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
                  <div
                    key={c}
                    style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.8 }}
                  />
                ))}
              </div>
            </div>

            {videoSrc ? (
              <video
                ref={videoRef}
                src={videoSrc}
                muted
                playsInline
                onEnded={triggerShrink}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  marginTop: "36px",
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  marginTop: "36px",
                  background:
                    "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(29,78,216,0.18) 0%, rgba(10,10,10,1) 70%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                }}
              >
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.06, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    border: "1.5px solid rgba(74,139,255,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(74,139,255,0.8)">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </motion.div>
                <p
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "rgba(74,139,255,0.5)",
                    fontFamily: "'SF Mono', 'Fira Code', monospace",
                  }}
                >
                  video not configured
                </p>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={triggerShrink}
                  style={{
                    marginTop: "8px",
                    padding: "8px 20px",
                    background: "rgba(74,139,255,0.12)",
                    border: "1px solid rgba(74,139,255,0.3)",
                    borderRadius: "8px",
                    color: "rgba(74,139,255,0.85)",
                    fontSize: "11px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    fontFamily: "'SF Mono', 'Fira Code', monospace",
                    cursor: "pointer",
                  }}
                >
                  Continue →
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "video" && (
          <motion.button
            key="skip"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8, transition: { duration: 0.2 } }}
            transition={{ delay: 1.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={triggerShrink}
            style={{
              position: "absolute",
              bottom: "32px",
              right: "32px",
              zIndex: 40,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 18px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(250,250,250,0.12)",
              borderRadius: "8px",
              color: "rgba(250,250,250,0.45)",
              fontSize: "11px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              cursor: "pointer",
            }}
          >
            Skip
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5,4 15,12 5,20" />
              <line x1="19" y1="4" x2="19" y2="20" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

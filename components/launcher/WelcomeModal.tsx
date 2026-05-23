"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Map, Zap, BookOpen } from "lucide-react";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    icon: Map,
    title: "Explore the AI map",
    desc: "Each bubble represents an AI tool. The map shows how they relate to each other.",
  },
  {
    icon: Zap,
    title: "Live experiences",
    desc: "Glowing bubbles are ready to explore. Click them to enter an immersive AI tutorial.",
  },
  {
    icon: BookOpen,
    title: "Learn by doing",
    desc: "Each experience is an interactive lesson — ask questions, get answers, build intuition.",
  },
];

export default function WelcomeModal({ open, onClose }: WelcomeModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="welcome-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.58)",
            backdropFilter: "blur(14px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: "20px",
          }}
        >
          <motion.div
            initial={{ scale: 0.86, opacity: 0, y: 28 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 18 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(12,12,20,0.97)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: "24px",
              padding: "44px 40px 36px",
              maxWidth: "480px",
              width: "100%",
              position: "relative",
              backdropFilter: "blur(20px)",
              boxShadow:
                "0 0 80px rgba(99,102,241,0.08), 0 40px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            <button
              onClick={onClose}
              aria-label="Close welcome"
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: "8px",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "rgba(250,250,250,0.4)",
              }}
            >
              <X size={14} />
            </button>

            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                border: "1.5px solid rgba(99,102,241,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
                background: "rgba(99,102,241,0.07)",
              }}
            >
              <span style={{ fontSize: "22px" }}>🚀</span>
            </motion.div>

            <h2
              style={{
                fontSize: "1.55rem",
                fontWeight: 700,
                color: "#FAFAFA",
                marginBottom: "8px",
                letterSpacing: "-0.02em",
              }}
            >
              Welcome to Singularity
            </h2>
            <p
              style={{
                fontSize: "0.9rem",
                color: "rgba(250,250,250,0.45)",
                marginBottom: "32px",
                lineHeight: 1.6,
              }}
            >
              Your interactive map of AI — explore tools, learn through
              experience, and build real intuition.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginBottom: "32px",
              }}
            >
              {STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.15 + i * 0.1,
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{
                    display: "flex",
                    gap: "14px",
                    alignItems: "flex-start",
                    padding: "13px 15px",
                    background: "rgba(255,255,255,0.025)",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.055)",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "10px",
                      background: "rgba(99,102,241,0.1)",
                      border: "1px solid rgba(99,102,241,0.22)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <step.icon size={16} color="rgba(99,102,241,0.8)" />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        color: "#FAFAFA",
                        marginBottom: "3px",
                      }}
                    >
                      {step.title}
                    </p>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "rgba(250,250,250,0.4)",
                        lineHeight: 1.55,
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              style={{
                width: "100%",
                padding: "14px",
                background: "rgba(99,102,241,0.13)",
                border: "1px solid rgba(99,102,241,0.3)",
                borderRadius: "14px",
                color: "#818cf8",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.02em",
              }}
            >
              Explore the map →
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

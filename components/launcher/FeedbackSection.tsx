"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";

export default function FeedbackSection() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ textAlign: "center", padding: "0 0 40px" }}>
      {!open ? (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setOpen(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            color: "rgba(250,250,250,0.45)",
            fontSize: "0.82rem",
            cursor: "pointer",
            letterSpacing: "0.02em",
          }}
        >
          <MessageSquare size={14} />
          Share feedback
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16,1,0.3,1] }}
          style={{
            maxWidth: 520,
            margin: "0 auto",
            padding: "28px 24px",
            background: "rgba(17,17,17,0.9)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "18px",
          }}
        >
          <p style={{ fontSize: "1rem", fontWeight: 600, color: "#FAFAFA", marginBottom: "8px" }}>
            We’d love your feedback
          </p>
          <p style={{ fontSize: "0.82rem", color: "rgba(250,250,250,0.45)", marginBottom: "20px", lineHeight: 1.6 }}>
            Help us improve Singularity. Share what you loved, what you’d change, or what you’d like to see next.
          </p>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSd-placeholder/viewform"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "10px 22px",
              background: "rgba(99,102,241,0.14)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: "10px",
              color: "#818cf8",
              fontSize: "0.85rem",
              fontWeight: 600,
              textDecoration: "none",
              marginRight: "10px",
            }}
          >
            Open feedback form →
          </a>
          <button
            onClick={() => setOpen(false)}
            style={{
              padding: "10px 16px",
              background: "transparent",
              border: "none",
              color: "rgba(250,250,250,0.3)",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            Dismiss
          </button>
        </motion.div>
      )}
    </div>
  );
}

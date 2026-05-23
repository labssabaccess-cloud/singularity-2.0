"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getToolById } from "@/lib/tools";
import { getPromptConfig } from "@/lib/singularityPrompts";

// ─── Types ───────────────────────────────────────────────────────────────────
type Message = { role: "user" | "assistant"; content: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────
function seededVal(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function AmbientParticles() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: seededVal(i, 1) * 100,
        y: seededVal(i, 2) * 100,
        size: 1 + Math.floor(seededVal(i, 3) * 3),
        dur: 8 + seededVal(i, 4) * 10,
        delay: seededVal(i, 5) * 6,
      })),
    []
  );

  if (!mounted) return null;

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: "rgba(99,102,241,0.5)",
          }}
          animate={{ y: [0, -30, 0], opacity: [0, 0.5, 0] }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function MarkdownLine({ text }: { text: string }) {
  // Bold
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} style={{ color: "rgba(250,250,250,0.92)", fontWeight: 600 }}>
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function MessageBubble({ msg, isLatest }: { msg: Message; isLatest: boolean }) {
  const isUser = msg.role === "user";
  const lines = msg.content.split("\n").filter((l) => l.trim() !== "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          maxWidth: "76%",
          padding: "12px 16px",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          background: isUser
            ? "rgba(99,102,241,0.22)"
            : "rgba(255,255,255,0.04)",
          border: isUser
            ? "1px solid rgba(99,102,241,0.35)"
            : "1px solid rgba(255,255,255,0.08)",
          fontSize: "0.88rem",
          lineHeight: 1.7,
          color: isUser ? "rgba(250,250,250,0.88)" : "rgba(250,250,250,0.72)",
        }}
      >
        {lines.map((line, i) => {
          const isHeading = line.startsWith("### ") || line.startsWith("## ") || line.startsWith("# ");
          const isBullet = line.startsWith("- ") || line.startsWith("* ");
          const clean = line.replace(/^#{1,3}\s/, "").replace(/^[-*]\s/, "");

          if (isHeading) {
            return (
              <p key={i} style={{ fontWeight: 600, color: "rgba(250,250,250,0.88)", marginBottom: "4px" }}>
                <MarkdownLine text={clean} />
              </p>
            );
          }
          if (isBullet) {
            return (
              <p key={i} style={{ paddingLeft: "12px", position: "relative", marginBottom: "2px" }}>
                <span style={{ position: "absolute", left: 0, opacity: 0.5 }}>·</span>
                <MarkdownLine text={clean} />
              </p>
            );
          }
          return (
            <p key={i} style={{ marginBottom: i < lines.length - 1 ? "6px" : 0 }}>
              <MarkdownLine text={line} />
            </p>
          );
        })}
        {isLatest && msg.role === "assistant" && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
            style={{
              display: "inline-block",
              width: 2,
              height: "0.9em",
              background: "rgba(99,102,241,0.8)",
              marginLeft: 2,
              verticalAlign: "middle",
            }}
          />
        )}
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SingularityToolPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const router = useRouter();
  const tool = getToolById(toolId);
  const config = getPromptConfig(tool);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [entered, setEntered] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Redirect if tool not found or not ready
  useEffect(() => {
    if (!tool || !tool.ready) {
      router.replace("/launcher");
    }
  }, [tool, router]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;

      const userMsg: Message = { role: "user", content: trimmed };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setInput("");
      setStreaming(true);

      // Placeholder assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages,
            toolId: tool?.id ?? "",
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) throw new Error("Stream failed");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { role: "assistant", content: accumulated },
          ]);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setMessages((prev) => [
            ...prev.slice(0, -1),
            {
              role: "assistant",
              content: "Something went wrong. Please try again.",
            },
          ]);
        }
      } finally {
        setStreaming(false);
      }
    },
    [messages, streaming, tool]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (!tool || !tool.ready) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#080810",
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
          background: `radial-gradient(ellipse 65% 45% at 50% 35%, ${tool.glowColor.replace("0.55", "0.07").replace("0.3", "0.05")} 0%, transparent 70%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <AmbientParticles />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : -14 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          backdropFilter: "blur(12px)",
          background: "rgba(8,8,16,0.8)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => router.push("/launcher")}
            aria-label="Return to launcher"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              color: "rgba(250,250,250,0.4)",
              fontSize: "0.78rem",
              cursor: "pointer",
              letterSpacing: "0.04em",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6" />
            </svg>
            Map
          </button>

          {/* Tool badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 12px",
              background: tool.color,
              border: `1px solid ${tool.glowColor.replace("0.55", "0.3").replace("0.3", "0.25")}`,
              borderRadius: "999px",
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: tool.textColor,
              }}
            />
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: tool.textColor,
              }}
            >
              {config.welcomeTitle}
            </span>
          </div>
        </div>

        <span
          style={{
            fontSize: "0.72rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(250,250,250,0.2)",
            fontFamily: "'SF Mono','Fira Code',monospace",
          }}
        >
          Singularity
        </span>
      </motion.header>

      {/* Welcome headline (shown only when no messages) */}
      <AnimatePresence>
        {messages.length === 0 && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : 20 }}
            exit={{ opacity: 0, y: -12, transition: { duration: 0.35 } }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "32px 24px",
              position: "relative",
              zIndex: 5,
              textAlign: "center",
              gap: "24px",
            }}
          >
            {/* Glow orb */}
            <motion.div
              animate={{
                boxShadow: [
                  `0 0 40px ${tool.glowColor}`,
                  `0 0 80px ${tool.glowColor}`,
                  `0 0 40px ${tool.glowColor}`,
                ],
                scale: [1, 1.06, 1],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: tool.color,
                border: `1.5px solid ${tool.glowColor.replace("0.55", "0.4").replace("0.3", "0.3")}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "28px" }}>
                {tool.id === "prompt-engineering" ? "✦" : "🔷"}
              </span>
            </motion.div>

            <div>
              <h1
                style={{
                  fontSize: "clamp(1.4rem, 3vw, 2rem)",
                  fontWeight: 700,
                  color: "#FAFAFA",
                  letterSpacing: "-0.02em",
                  marginBottom: "8px",
                }}
              >
                {config.welcomeTitle}
              </h1>
              <p style={{ fontSize: "0.9rem", color: "rgba(250,250,250,0.45)", maxWidth: "380px" }}>
                {config.welcomeSubtitle}
              </p>
            </div>

            {/* Suggested prompts */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                justifyContent: "center",
                maxWidth: "560px",
              }}
            >
              {config.suggestedPrompts.map((prompt) => (
                <motion.button
                  key={prompt}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => sendMessage(prompt)}
                  style={{
                    padding: "8px 14px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "999px",
                    color: "rgba(250,250,250,0.55)",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    letterSpacing: "0.01em",
                    transition: "all 0.2s",
                  }}
                >
                  {prompt}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      {messages.length > 0 && (
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 20px 8px",
            position: "relative",
            zIndex: 5,
            scrollbarWidth: "none",
          }}
        >
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            {messages.map((msg, i) => (
              <MessageBubble
                key={i}
                msg={msg}
                isLatest={i === messages.length - 1 && streaming}
              />
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : 20 }}
        transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          zIndex: 10,
          padding: "16px 20px 20px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          backdropFilter: "blur(16px)",
          background: "rgba(8,8,16,0.85)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            display: "flex",
            gap: "10px",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${
                input.length > 0
                  ? tool.glowColor.replace("0.55", "0.3").replace("0.3", "0.25")
                  : "rgba(255,255,255,0.08)"
              }`,
              borderRadius: "14px",
              padding: "12px 16px",
              transition: "border-color 0.2s",
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask about ${config.welcomeTitle}…`}
              rows={1}
              disabled={streaming}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                color: "rgba(250,250,250,0.85)",
                fontSize: "0.9rem",
                lineHeight: 1.6,
                fontFamily: "inherit",
                maxHeight: "120px",
                overflow: "auto",
                scrollbarWidth: "none",
              }}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 120) + "px";
              }}
            />
          </div>

          <motion.button
            whileHover={{ scale: streaming ? 1 : 1.06 }}
            whileTap={{ scale: streaming ? 1 : 0.94 }}
            onClick={() => {
              if (streaming) {
                abortRef.current?.abort();
                setStreaming(false);
              } else {
                sendMessage(input);
              }
            }}
            style={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              flexShrink: 0,
              background: streaming
                ? "rgba(239,68,68,0.15)"
                : input.trim()
                ? tool.color
                : "rgba(255,255,255,0.04)",
              border: streaming
                ? "1px solid rgba(239,68,68,0.3)"
                : input.trim()
                ? `1px solid ${tool.glowColor.replace("0.55", "0.4").replace("0.3", "0.3")}`
                : "1px solid rgba(255,255,255,0.08)",
              cursor: streaming || input.trim() ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              boxShadow: input.trim() && !streaming ? `0 0 16px ${tool.glowColor.replace("0.55", "0.2").replace("0.3", "0.15")}` : "none",
            }}
          >
            {streaming ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(239,68,68,0.8)">
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? tool.textColor : "rgba(250,250,250,0.25)"} strokeWidth="2">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5,12 12,5 19,12" />
              </svg>
            )}
          </motion.button>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: "0.7rem",
            color: "rgba(250,250,250,0.18)",
            marginTop: "8px",
            letterSpacing: "0.04em",
          }}
        >
          Enter to send · Shift+Enter for new line · Powered by Gemini
        </p>
      </motion.div>
    </div>
  );
}

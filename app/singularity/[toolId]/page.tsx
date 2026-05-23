"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getToolById } from "@/lib/tools";
import { getPromptConfig } from "@/lib/singularityPrompts";
import { markCompleted } from "@/lib/progress";

const FEEDBACK_URL = "https://forms.gle/SSYGsUrGqch8VeMV8";

// ─── Types ───────────────────────────────────────────────────────────────────────────────
type Message = { role: "user" | "assistant"; content: string };
type ConceptCard = { id: string; term: string; excerpt: string };

// ─── SSR-safe particles ────────────────────────────────────────────────────────────────
function seededVal(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function AmbientParticles({ glowColor }: { glowColor: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const particles = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: seededVal(i, 1) * 100,
      y: seededVal(i, 2) * 100,
      size: 1 + Math.floor(seededVal(i, 3) * 3),
      dur: 8 + seededVal(i, 4) * 10,
      delay: seededVal(i, 5) * 6,
    })),
  []);
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
            background: glowColor,
          }}
          animate={{ y: [0, -30, 0], opacity: [0, 0.45, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Tool-specific welcome icon ────────────────────────────────────────────────────────
function ToolIcon({ toolId, textColor }: { toolId: string; textColor: string }) {
  if (toolId === "prompt-engineering") {
    return (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
        <text x="4" y="23" fontSize="20" fontFamily="'SF Mono','Fira Code',monospace" fill={textColor} opacity="0.9">{"{ }"}</text>
        <circle cx="27" cy="8" r="3" fill={textColor} opacity="0.6" />
      </svg>
    );
  }
  if (toolId === "gemini") {
    // Gemini 4-pointed star mark
    return (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
        <path
          d="M16 2 C16 10 22 16 30 16 C22 16 16 22 16 30 C16 22 10 16 2 16 C10 16 16 10 16 2Z"
          fill={textColor}
          opacity="0.9"
        />
      </svg>
    );
  }
  return <span style={{ fontSize: 26, lineHeight: 1 }}>❖</span>;
}

// ─── Concept card extraction from AI response ─────────────────────────────────────────
function extractConcepts(text: string): ConceptCard[] {
  const concepts: ConceptCard[] = [];
  const boldRegex = /\*\*([^*]{3,40})\*\*/g;
  const seen = new Set<string>();
  let match;
  while ((match = boldRegex.exec(text)) !== null) {
    const term = match[1].trim();
    if (seen.has(term)) continue;
    seen.add(term);
    const start = Math.max(0, match.index - 20);
    const raw = text.slice(start, match.index + 120).replace(/\*\*/g, "");
    const excerpt = raw.replace(/^[^A-Z]/, "").slice(0, 90) + "…";
    concepts.push({ id: `${term}-${concepts.length}`, term, excerpt });
    if (concepts.length >= 6) break;
  }
  if (concepts.length === 0) {
    const lines = text.split("\n").filter((l) => l.trim().length > 20).slice(0, 3);
    lines.forEach((line, i) => {
      const clean = line.replace(/^#{1,3}\s*/, "").replace(/^[-*]\s*/, "").trim();
      if (clean.length > 10) {
        concepts.push({ id: `line-${i}`, term: clean.slice(0, 32) + (clean.length > 32 ? "…" : ""), excerpt: clean.slice(0, 90) + "…" });
      }
    });
  }
  return concepts;
}

// ─── Markdown renderer ──────────────────────────────────────────────────────────────────────
function MarkdownLine({ text }: { text: string }) {
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

function MessageBubble({ msg, isStreaming }: { msg: Message; isStreaming: boolean }) {
  const isUser = msg.role === "user";
  const lines = msg.content.split("\n").filter((l) => l.trim() !== "");
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: "14px" }}
    >
      <div
        style={{
          maxWidth: "88%",
          padding: "11px 15px",
          borderRadius: isUser ? "16px 16px 3px 16px" : "16px 16px 16px 3px",
          background: isUser ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
          border: isUser ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(255,255,255,0.07)",
          fontSize: "0.86rem",
          lineHeight: 1.7,
          color: isUser ? "rgba(250,250,250,0.88)" : "rgba(250,250,250,0.7)",
        }}
      >
        {lines.map((line, i) => {
          const isHeading = /^#{1,3}\s/.test(line);
          const isBullet = /^[-*]\s/.test(line);
          const clean = line.replace(/^#{1,3}\s/, "").replace(/^[-*]\s/, "");
          if (isHeading) return <p key={i} style={{ fontWeight: 600, color: "rgba(250,250,250,0.9)", marginBottom: 4 }}><MarkdownLine text={clean} /></p>;
          if (isBullet) return <p key={i} style={{ paddingLeft: 12, position: "relative", marginBottom: 2 }}><span style={{ position: "absolute", left: 0, opacity: 0.4 }}>·</span><MarkdownLine text={clean} /></p>;
          return <p key={i} style={{ marginBottom: i < lines.length - 1 ? 5 : 0 }}><MarkdownLine text={line} /></p>;
        })}
        {isStreaming && msg.role === "assistant" && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.55, repeat: Infinity, repeatType: "reverse" }}
            style={{ display: "inline-block", width: 2, height: "0.85em", background: "rgba(99,102,241,0.8)", marginLeft: 2, verticalAlign: "middle" }}
          />
        )}
      </div>
    </motion.div>
  );
}

// ─── Concept Board ────────────────────────────────────────────────────────────────────────
function ConceptBoard({
  concepts,
  toolTextColor,
  toolGlowColor,
  onAsk,
  isSeeded,
}: {
  concepts: ConceptCard[];
  toolTextColor: string;
  toolGlowColor: string;
  onAsk: (question: string) => void;
  isSeeded: boolean;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        padding: "20px 16px",
        scrollbarWidth: "none",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <div style={{ marginBottom: "4px" }}>
        <p style={{ fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(250,250,250,0.25)" }}>
          {isSeeded ? "Start here" : "Concept Board"}
        </p>
        <p style={{ fontSize: "0.7rem", color: "rgba(250,250,250,0.18)", marginTop: 3 }}>
          {isSeeded ? "Tap any concept to explore it" : "Click any concept to ask about it"}
        </p>
      </div>

      {concepts.length === 0 && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            opacity: 0.3,
            textAlign: "center",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <span style={{ fontSize: "0.72rem", color: "rgba(250,250,250,0.4)" }}>Key concepts will appear here as you chat</span>
        </div>
      )}

      <AnimatePresence>
        {concepts.map((c, i) => (
          <motion.button
            key={c.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onAsk(`Can you teach me about "${c.term}"? Give a clear explanation with a practical example.`)}
            style={{
              textAlign: "left",
              padding: "10px 12px",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${toolGlowColor.replace("0.55", "0.15").replace("0.3", "0.12")}`,
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all 0.18s",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: toolTextColor,
                marginBottom: isSeeded ? 0 : 4,
                lineHeight: 1.3,
              }}
            >
              {c.term}
            </div>
            {!isSeeded && c.excerpt && (
              <div
                style={{
                  fontSize: "0.66rem",
                  color: "rgba(250,250,250,0.3)",
                  lineHeight: 1.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  marginBottom: 4,
                }}
              >
                {c.excerpt}
              </div>
            )}
            <div
              style={{
                marginTop: 5,
                fontSize: "0.6rem",
                color: toolTextColor,
                opacity: 0.5,
                letterSpacing: "0.06em",
              }}
            >
              tap to explore →
            </div>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Feedback nudge toast ───────────────────────────────────────────────────────────────
function FeedbackNudge({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed",
        bottom: 80,
        right: 20,
        zIndex: 50,
        background: "rgba(20,20,32,0.96)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 14,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        maxWidth: 280,
      }}
    >
      <span style={{ fontSize: 20 }}>💬</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "0.78rem", color: "rgba(250,250,250,0.8)", fontWeight: 600, marginBottom: 2 }}>
          Enjoying this?
        </p>
        <a
          href={FEEDBACK_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: "0.72rem", color: "#818cf8", textDecoration: "none" }}
        >
          Share your feedback →
        </a>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss feedback nudge"
        style={{
          background: "none",
          border: "none",
          color: "rgba(250,250,250,0.25)",
          cursor: "pointer",
          fontSize: 16,
          lineHeight: 1,
          padding: 2,
        }}
      >
        ×
      </button>
    </motion.div>
  );
}

// ─── API error state ─────────────────────────────────────────────────────────────────────
function ApiErrorState({ toolName, router }: { toolName: string; router: ReturnType<typeof useRouter> }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ fontSize: 40 }}
      >
        🔧
      </motion.div>
      <div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#FAFAFA", marginBottom: 8 }}>
          {toolName} is warming up
        </h2>
        <p style={{ fontSize: "0.82rem", color: "rgba(250,250,250,0.4)", maxWidth: 320, lineHeight: 1.6 }}>
          The AI engine hasn&apos;t been configured yet. This experience will be live very soon — check back shortly!
        </p>
      </div>
      <button
        onClick={() => router.push("/launcher")}
        style={{
          padding: "9px 20px",
          background: "rgba(99,102,241,0.15)",
          border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: "10px",
          color: "#818cf8",
          fontSize: "0.82rem",
          cursor: "pointer",
          letterSpacing: "0.04em",
        }}
      >
        ← Back to the map
      </button>
    </motion.div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────────────────────
export default function SingularityToolPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const router = useRouter();
  const tool = getToolById(toolId);
  const config = getPromptConfig(tool);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [entered, setEntered] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [showFeedbackNudge, setShowFeedbackNudge] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  // Concept board: start with seed concepts, then update from AI responses
  const seedCards: ConceptCard[] = useMemo(
    () => config.seedConcepts.map((term, i) => ({ id: `seed-${i}`, term, excerpt: "" })),
    [config.seedConcepts]
  );
  const [concepts, setConcepts] = useState<ConceptCard[]>(seedCards);
  const [isSeeded, setIsSeeded] = useState(config.seedConcepts.length > 0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => { const t = setTimeout(() => setEntered(true), 60); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (!tool || !tool.ready) router.replace("/launcher");
  }, [tool, router]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Extract concepts from AI responses; replace seed once there's real content
  useEffect(() => {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (last && last.content.length > 80) {
      const extracted = extractConcepts(last.content);
      if (extracted.length > 0) {
        setConcepts(extracted);
        setIsSeeded(false);
      }
    }
  }, [messages]);

  // Show feedback nudge after 3 AI exchanges (6 messages)
  useEffect(() => {
    if (!nudgeDismissed && messages.length >= 6 && !showFeedbackNudge) {
      const t = setTimeout(() => setShowFeedbackNudge(true), 1200);
      return () => clearTimeout(t);
    }
  }, [messages.length, nudgeDismissed, showFeedbackNudge]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;

      // When sending a message, replace seed concepts with real ones from the response
      if (isSeeded) setIsSeeded(false);

      const userMsg: Message = { role: "user", content: trimmed };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setInput("");
      setStreaming(true);
      setApiError(false);
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: nextMessages, toolId: tool?.id ?? "" }),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) {
          setApiError(true);
          setMessages((prev) => prev.slice(0, -1));
          setStreaming(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages((prev) => [...prev.slice(0, -1), { role: "assistant", content: accumulated }]);
        }

        if (!hasCompleted && tool) {
          markCompleted(tool.id);
          setHasCompleted(true);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setApiError(true);
          setMessages((prev) => prev.slice(0, -1));
        }
      } finally {
        setStreaming(false);
      }
    },
    [messages, streaming, tool, hasCompleted, isSeeded]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  if (!tool || !tool.ready) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#080810", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Ambient glow */}
      <div aria-hidden style={{ position: "fixed", inset: 0, background: `radial-gradient(ellipse 65% 45% at 50% 35%, ${tool.glowColor.replace("0.55", "0.06").replace("0.3", "0.04")} 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0 }} />
      <AmbientParticles glowColor={tool.glowColor} />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : -14 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative", zIndex: 10, display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "14px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          backdropFilter: "blur(12px)", background: "rgba(8,8,16,0.8)", flexShrink: 0,
        }}
      >
        {/* Left: nav + tool badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => router.push("/launcher")}
            aria-label="Return to launcher"
            style={{
              display: "flex", alignItems: "center", gap: 5, padding: "5px 10px",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, color: "rgba(250,250,250,0.38)", fontSize: "0.75rem", cursor: "pointer",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6" /></svg>
            Map
          </button>
          <div style={{
            display: "flex", alignItems: "center", gap: 7, padding: "4px 12px",
            background: tool.color, border: `1px solid ${tool.glowColor.replace("0.55", "0.28").replace("0.3", "0.22")}`,
            borderRadius: 999,
          }}>
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 5, height: 5, borderRadius: "50%", background: tool.textColor }}
            />
            <span style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", color: tool.textColor }}>
              {config.welcomeTitle}
            </span>
          </div>
          {hasCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
                background: "rgba(99,241,120,0.1)", border: "1px solid rgba(99,241,120,0.3)",
                borderRadius: 999,
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <polyline points="1.5,5 4,7.5 8.5,2" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: "0.68rem", color: "#4ade80", letterSpacing: "0.05em" }}>Explored</span>
            </motion.div>
          )}
        </div>

        {/* Right: feedback + brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a
            href={FEEDBACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share feedback"
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 10px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 8,
              color: "rgba(250,250,250,0.32)",
              fontSize: "0.72rem",
              textDecoration: "none",
              letterSpacing: "0.03em",
              transition: "all 0.18s",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Feedback
          </a>
          <span style={{ fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(250,250,250,0.18)", fontFamily: "'SF Mono','Fira Code',monospace" }}>Singularity</span>
        </div>
      </motion.header>

      {/* API Error overlay */}
      <AnimatePresence>
        {apiError && messages.length === 0 && (
          <ApiErrorState toolName={config.welcomeTitle} router={router} />
        )}
      </AnimatePresence>

      {/* Main split layout */}
      {!apiError && (
        <div style={{ flex: 1, display: "flex", minHeight: 0, position: "relative", zIndex: 5 }}>

          {/* LEFT: Concept board */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: entered ? 1 : 0, x: entered ? 0 : -20 }}
            transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: 240,
              flexShrink: 0,
              borderRight: "1px solid rgba(255,255,255,0.05)",
              background: "rgba(255,255,255,0.015)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <ConceptBoard
              concepts={concepts}
              toolTextColor={tool.textColor}
              toolGlowColor={tool.glowColor}
              onAsk={sendMessage}
              isSeeded={isSeeded}
            />
          </motion.div>

          {/* RIGHT: Chat area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

            {/* Welcome screen (no messages) */}
            <AnimatePresence>
              {messages.length === 0 && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : 20 }}
                  exit={{ opacity: 0, y: -12, transition: { duration: 0.3 } }}
                  transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", padding: "24px 20px", gap: 20, textAlign: "center",
                  }}
                >
                  <motion.div
                    animate={{
                      boxShadow: [`0 0 36px ${tool.glowColor}`, `0 0 72px ${tool.glowColor}`, `0 0 36px ${tool.glowColor}`],
                      scale: [1, 1.06, 1],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      width: 72, height: 72, borderRadius: "50%", background: tool.color,
                      border: `1.5px solid ${tool.glowColor.replace("0.55", "0.4").replace("0.3", "0.3")}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <ToolIcon toolId={tool.id} textColor={tool.textColor} />
                  </motion.div>
                  <div>
                    <h1 style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.7rem)", fontWeight: 700, color: "#FAFAFA", letterSpacing: "-0.02em", marginBottom: 6 }}>
                      {config.welcomeTitle}
                    </h1>
                    <p style={{ fontSize: "0.84rem", color: "rgba(250,250,250,0.4)", maxWidth: 360 }}>
                      {config.welcomeSubtitle}
                    </p>
                  </div>
                  {/* Suggested prompts — 2 rows of 5 */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 560 }}>
                    {config.suggestedPrompts.map((prompt) => (
                      <motion.button
                        key={prompt}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => sendMessage(prompt)}
                        style={{
                          padding: "7px 13px", background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.09)", borderRadius: 999,
                          color: "rgba(250,250,250,0.5)", fontSize: "0.77rem", cursor: "pointer",
                        }}
                      >
                        {prompt}
                      </motion.button>
                    ))}
                  </div>
                  <p style={{ fontSize: "0.68rem", color: "rgba(250,250,250,0.15)", letterSpacing: "0.04em" }}>
                    Or tap a concept on the left to start →
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            {messages.length > 0 && (
              <div
                ref={scrollRef}
                style={{
                  flex: 1, overflowY: "auto", padding: "20px 20px 6px",
                  scrollbarWidth: "none",
                }}
              >
                <div style={{ maxWidth: 660, margin: "0 auto" }}>
                  {messages.map((msg, i) => (
                    <MessageBubble key={i} msg={msg} isStreaming={i === messages.length - 1 && streaming} />
                  ))}
                  {apiError && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: "12px 16px", background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12,
                        fontSize: "0.8rem", color: "rgba(250,100,100,0.8)", marginBottom: 12,
                      }}
                    >
                      ⚠️ Couldn&apos;t reach the AI engine. Please try again shortly.
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* Input bar */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : 16 }}
              transition={{ delay: 0.35, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{
                padding: "12px 16px 16px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                backdropFilter: "blur(16px)",
                background: "rgba(8,8,16,0.85)",
                flexShrink: 0,
              }}
            >
              <div style={{ maxWidth: 660, margin: "0 auto", display: "flex", gap: 9, alignItems: "flex-end" }}>
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${ input.length > 0 ? tool.glowColor.replace("0.55", "0.28").replace("0.3", "0.22") : "rgba(255,255,255,0.07)" }`,
                    borderRadius: 13, padding: "10px 14px", transition: "border-color 0.18s",
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
                      width: "100%", background: "transparent", border: "none", outline: "none",
                      resize: "none", color: "rgba(250,250,250,0.85)", fontSize: "0.87rem",
                      lineHeight: 1.6, fontFamily: "inherit", maxHeight: 110, overflow: "auto",
                      scrollbarWidth: "none",
                    }}
                    onInput={(e) => {
                      const t = e.currentTarget;
                      t.style.height = "auto";
                      t.style.height = Math.min(t.scrollHeight, 110) + "px";
                    }}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: streaming ? 1 : 1.07 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => { if (streaming) { abortRef.current?.abort(); setStreaming(false); } else { sendMessage(input); } }}
                  aria-label={streaming ? "Stop" : "Send"}
                  style={{
                    width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                    background: streaming ? "rgba(239,68,68,0.14)" : input.trim() ? tool.color : "rgba(255,255,255,0.04)",
                    border: streaming ? "1px solid rgba(239,68,68,0.28)" : input.trim() ? `1px solid ${tool.glowColor.replace("0.55", "0.38").replace("0.3", "0.28")}` : "1px solid rgba(255,255,255,0.07)",
                    cursor: streaming || input.trim() ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.18s",
                    boxShadow: input.trim() && !streaming ? `0 0 14px ${tool.glowColor.replace("0.55", "0.18").replace("0.3", "0.12")}` : "none",
                  }}
                >
                  {streaming
                    ? <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(239,68,68,0.8)"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
                    : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? tool.textColor : "rgba(250,250,250,0.22)"} strokeWidth="2"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5,12 12,5 19,12" /></svg>
                  }
                </motion.button>
              </div>
              <p style={{ textAlign: "center", fontSize: "0.65rem", color: "rgba(250,250,250,0.15)", marginTop: 6, letterSpacing: "0.04em" }}>
                Enter to send · Shift+Enter for new line · Powered by Gemini
              </p>
            </motion.div>
          </div>
        </div>
      )}

      {/* Feedback nudge toast */}
      <AnimatePresence>
        {showFeedbackNudge && (
          <FeedbackNudge onDismiss={() => { setShowFeedbackNudge(false); setNudgeDismissed(true); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

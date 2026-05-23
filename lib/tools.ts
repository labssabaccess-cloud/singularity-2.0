export type ToolCategory =
  | "ai-chat"
  | "image-gen"
  | "video-gen"
  | "audio-gen"
  | "productivity"
  | "dev"
  | "core";

export type BubbleSize = "anchor" | "large" | "medium" | "small";

export interface Tool {
  id: string;
  name: string;
  ready: boolean;
  category: ToolCategory;
  color: string;
  glowColor: string;
  textColor: string;
  size: BubbleSize;
  angle: number;
  radius: number;
  tagline: string;
}

// Category metadata for visual grouping labels
export const CATEGORY_META: Record<ToolCategory, { label: string; angle: number }> = {
  core:        { label: "Core",         angle: 0   },
  "ai-chat":   { label: "AI Chat",      angle: 350 },
  "image-gen": { label: "Image AI",     angle: 135 },
  "video-gen": { label: "Video AI",     angle: 220 },
  "audio-gen": { label: "Audio AI",     angle: 265 },
  productivity:{ label: "Productivity", angle: 175 },
  dev:         { label: "Dev & ML",     angle: 85  },
};

/**
 * LAYOUT SYSTEM — two-ring constellation:
 *
 * INNER ring  radius 36–40  → large / prominent neighbours of anchor
 * MIDDLE ring radius 50–56  → medium nodes
 * OUTER ring  radius 63–70  → small nodes
 *
 * Angular spacing rules:
 * - No two bubbles within 18° of each other AT THE SAME RADIUS RING
 * - Outer-ring bubbles are offset ~9° from their parent medium node
 *   so they don't stack radially
 * - All angles measured clockwise from 3 o'clock (standard math convention)
 *   0° = right, 90° = down, 180° = left, 270° = up
 *
 * Distribution target (anti-clockwise sweep):
 *   AI Chat cluster   → right side  (310°–50°)
 *   Dev/ML cluster    → upper-right (55°–95°)
 *   Image-gen cluster → upper-left  (100°–165°)
 *   Productivity      → left        (170°–210°)
 *   Video-gen cluster → lower-left  (215°–250°)
 *   Audio-gen cluster → lower       (255°–295°)
 *   (lower-right 295°–310° kept sparse as breathing room)
 */
export const TOOLS: Tool[] = [
  // ── Core anchor (center) ─────────────────────────────────────────────
  {
    id: "prompt-engineering",
    name: "Prompt Engineering",
    ready: true,
    category: "core",
    color: "rgba(99,102,241,0.18)",
    glowColor: "rgba(99,102,241,0.55)",
    textColor: "#818cf8",
    size: "anchor",
    angle: 0,
    radius: 0,
    tagline: "Master the art of AI communication",
  },

  // ── AI Chat cluster — right side (310° → 50°) ─────────────────────
  // Gemini: inner-ring, just right of anchor — most prominent ready tool
  {
    id: "gemini",
    name: "Gemini",
    ready: true,
    category: "ai-chat",
    color: "rgba(59,130,246,0.18)",
    glowColor: "rgba(59,130,246,0.55)",
    textColor: "#60a5fa",
    size: "large",
    angle: 20,
    radius: 38,
    tagline: "Google's multimodal AI model",
  },
  // ChatGPT: middle ring, slightly above right
  {
    id: "chatgpt",
    name: "ChatGPT",
    ready: false,
    category: "ai-chat",
    color: "rgba(16,185,129,0.12)",
    glowColor: "rgba(16,185,129,0.3)",
    textColor: "#6ee7b7",
    size: "medium",
    angle: 358,
    radius: 52,
    tagline: "OpenAI's conversational AI",
  },
  // Claude: middle ring, upper-right
  {
    id: "claude",
    name: "Claude",
    ready: false,
    category: "ai-chat",
    color: "rgba(245,158,11,0.12)",
    glowColor: "rgba(245,158,11,0.3)",
    textColor: "#fbbf24",
    size: "medium",
    angle: 335,
    radius: 52,
    tagline: "Anthropic's thoughtful AI",
  },
  // Perplexity: outer ring, far upper-right
  {
    id: "perplexity",
    name: "Perplexity",
    ready: false,
    category: "ai-chat",
    color: "rgba(20,184,166,0.12)",
    glowColor: "rgba(20,184,166,0.3)",
    textColor: "#2dd4bf",
    size: "small",
    angle: 316,
    radius: 66,
    tagline: "AI-powered search engine",
  },
  // Copilot: outer ring, lower-right quadrant
  {
    id: "copilot",
    name: "Microsoft Copilot",
    ready: false,
    category: "ai-chat",
    color: "rgba(59,130,246,0.12)",
    glowColor: "rgba(59,130,246,0.3)",
    textColor: "#93c5fd",
    size: "small",
    angle: 40,
    radius: 66,
    tagline: "Microsoft's AI assistant",
  },

  // ── Dev / ML cluster — upper-right (55°–95°) ─────────────────────────
  {
    id: "huggingface",
    name: "Hugging Face",
    ready: false,
    category: "dev",
    color: "rgba(245,158,11,0.12)",
    glowColor: "rgba(245,158,11,0.3)",
    textColor: "#fcd34d",
    size: "small",
    angle: 60,
    radius: 57,
    tagline: "Open-source ML hub",
  },
  {
    id: "replicate",
    name: "Replicate",
    ready: false,
    category: "dev",
    color: "rgba(16,185,129,0.12)",
    glowColor: "rgba(16,185,129,0.3)",
    textColor: "#6ee7b7",
    size: "small",
    angle: 82,
    radius: 66,
    tagline: "Run AI models in the cloud",
  },

  // ── Image generation cluster — upper-left (100°–165°) ────────────────
  // Midjourney: medium, inner ring of image cluster
  {
    id: "midjourney",
    name: "Midjourney",
    ready: false,
    category: "image-gen",
    color: "rgba(236,72,153,0.12)",
    glowColor: "rgba(236,72,153,0.3)",
    textColor: "#f9a8d4",
    size: "medium",
    angle: 118,
    radius: 50,
    tagline: "Stunning AI image creation",
  },
  // Stable Diffusion: outer ring, left of Midjourney
  {
    id: "stable-diffusion",
    name: "Stable Diffusion",
    ready: false,
    category: "image-gen",
    color: "rgba(139,92,246,0.12)",
    glowColor: "rgba(139,92,246,0.3)",
    textColor: "#c4b5fd",
    size: "small",
    angle: 100,
    radius: 66,
    tagline: "Open-source image AI",
  },
  // DALL·E 3: outer ring, right of Midjourney
  {
    id: "dalle3",
    name: "DALL·E 3",
    ready: false,
    category: "image-gen",
    color: "rgba(249,115,22,0.12)",
    glowColor: "rgba(249,115,22,0.3)",
    textColor: "#fb923c",
    size: "small",
    angle: 138,
    radius: 66,
    tagline: "OpenAI's image generator",
  },
  // Canva AI: outer ring, leftmost image bubble
  {
    id: "canva-ai",
    name: "Canva AI",
    ready: false,
    category: "image-gen",
    color: "rgba(16,185,129,0.12)",
    glowColor: "rgba(16,185,129,0.3)",
    textColor: "#34d399",
    size: "small",
    angle: 158,
    radius: 57,
    tagline: "AI design for everyone",
  },

  // ── Productivity cluster — left (170°–210°) ──────────────────────────
  // Notion AI: medium, inner ring
  {
    id: "notion-ai",
    name: "Notion AI",
    ready: false,
    category: "productivity",
    color: "rgba(250,250,250,0.1)",
    glowColor: "rgba(250,250,250,0.25)",
    textColor: "rgba(250,250,250,0.7)",
    size: "medium",
    angle: 180,
    radius: 50,
    tagline: "AI-powered workspace",
  },
  // ChatPDF: outer ring, upper of Notion
  {
    id: "chatpdf",
    name: "ChatPDF",
    ready: false,
    category: "productivity",
    color: "rgba(239,68,68,0.12)",
    glowColor: "rgba(239,68,68,0.3)",
    textColor: "#fca5a5",
    size: "small",
    angle: 168,
    radius: 66,
    tagline: "Chat with your documents",
  },
  // Gamma: outer ring, lower of Notion
  {
    id: "gamma",
    name: "Gamma",
    ready: false,
    category: "productivity",
    color: "rgba(236,72,153,0.12)",
    glowColor: "rgba(236,72,153,0.3)",
    textColor: "#f472b6",
    size: "small",
    angle: 196,
    radius: 66,
    tagline: "AI presentation builder",
  },
  // Copy.ai: outer ring, further left
  {
    id: "copyai",
    name: "Copy.ai",
    ready: false,
    category: "productivity",
    color: "rgba(99,102,241,0.12)",
    glowColor: "rgba(99,102,241,0.3)",
    textColor: "#a5b4fc",
    size: "small",
    angle: 210,
    radius: 57,
    tagline: "AI copywriting assistant",
  },
  // Jasper: outer ring
  {
    id: "jasper",
    name: "Jasper",
    ready: false,
    category: "productivity",
    color: "rgba(249,115,22,0.12)",
    glowColor: "rgba(249,115,22,0.3)",
    textColor: "#fdba74",
    size: "small",
    angle: 225,
    radius: 66,
    tagline: "AI marketing copywriter",
  },

  // ── Video generation cluster — lower-left (230°–258°) ────────────────
  // Runway: medium, inner ring
  {
    id: "runway",
    name: "Runway",
    ready: false,
    category: "video-gen",
    color: "rgba(239,68,68,0.12)",
    glowColor: "rgba(239,68,68,0.3)",
    textColor: "#fca5a5",
    size: "medium",
    angle: 238,
    radius: 50,
    tagline: "AI video generation studio",
  },
  // Synthesia: outer ring
  {
    id: "synthesia",
    name: "Synthesia",
    ready: false,
    category: "video-gen",
    color: "rgba(168,85,247,0.12)",
    glowColor: "rgba(168,85,247,0.3)",
    textColor: "#d8b4fe",
    size: "small",
    angle: 250,
    radius: 66,
    tagline: "AI video with avatars",
  },
  // Google Vids: outer ring, left of Synthesia
  {
    id: "google-vids",
    name: "Google Vids",
    ready: false,
    category: "video-gen",
    color: "rgba(59,130,246,0.12)",
    glowColor: "rgba(59,130,246,0.3)",
    textColor: "#7dd3fc",
    size: "small",
    angle: 232,
    radius: 66,
    tagline: "Google's AI video creator",
  },

  // ── Audio generation cluster — lower (262°–296°) ─────────────────────
  // ElevenLabs: medium, inner ring
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    ready: false,
    category: "audio-gen",
    color: "rgba(245,158,11,0.12)",
    glowColor: "rgba(245,158,11,0.3)",
    textColor: "#fde68a",
    size: "medium",
    angle: 278,
    radius: 50,
    tagline: "AI voice and audio synthesis",
  },
  // Otter.ai: outer ring
  {
    id: "otter-ai",
    name: "Otter.ai",
    ready: false,
    category: "audio-gen",
    color: "rgba(20,184,166,0.12)",
    glowColor: "rgba(20,184,166,0.3)",
    textColor: "#5eead4",
    size: "small",
    angle: 294,
    radius: 66,
    tagline: "AI meeting transcription",
  },
];

export function getToolById(id: string): Tool | undefined {
  return TOOLS.find((t) => t.id === id);
}

export const READY_TOOLS = TOOLS.filter((t) => t.ready);
export const DEV_TOOLS   = TOOLS.filter((t) => !t.ready);

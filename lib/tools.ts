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
  "ai-chat":   { label: "AI Chat",      angle: 15  },
  "image-gen": { label: "Image AI",     angle: 130 },
  "video-gen": { label: "Video AI",     angle: 230 },
  "audio-gen": { label: "Audio AI",     angle: 280 },
  productivity:{ label: "Productivity", angle: 185 },
  dev:         { label: "Dev & ML",     angle: 68  },
};

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
  // ── AI Chat ───────────────────────────────────────────────────────────
  {
    id: "gemini",
    name: "Gemini",
    ready: true,
    category: "ai-chat",
    color: "rgba(59,130,246,0.18)",
    glowColor: "rgba(59,130,246,0.55)",
    textColor: "#60a5fa",
    size: "large",
    angle: 22,
    radius: 38,
    tagline: "Google's multimodal AI model",
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    ready: false,
    category: "ai-chat",
    color: "rgba(16,185,129,0.12)",
    glowColor: "rgba(16,185,129,0.3)",
    textColor: "#6ee7b7",
    size: "medium",
    angle: 5,
    radius: 42,
    tagline: "OpenAI's conversational AI",
  },
  {
    id: "claude",
    name: "Claude",
    ready: false,
    category: "ai-chat",
    color: "rgba(245,158,11,0.12)",
    glowColor: "rgba(245,158,11,0.3)",
    textColor: "#fbbf24",
    size: "medium",
    angle: 345,
    radius: 42,
    tagline: "Anthropic's thoughtful AI",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    ready: false,
    category: "ai-chat",
    color: "rgba(20,184,166,0.12)",
    glowColor: "rgba(20,184,166,0.3)",
    textColor: "#2dd4bf",
    size: "small",
    angle: 328,
    radius: 58,
    tagline: "AI-powered search engine",
  },
  {
    id: "copilot",
    name: "Microsoft Copilot",
    ready: false,
    category: "ai-chat",
    color: "rgba(59,130,246,0.12)",
    glowColor: "rgba(59,130,246,0.3)",
    textColor: "#93c5fd",
    size: "small",
    angle: 38,
    radius: 58,
    tagline: "Microsoft's AI assistant",
  },
  // ── Image generation ──────────────────────────────────────────────────
  {
    id: "midjourney",
    name: "Midjourney",
    ready: false,
    category: "image-gen",
    color: "rgba(236,72,153,0.12)",
    glowColor: "rgba(236,72,153,0.3)",
    textColor: "#f9a8d4",
    size: "medium",
    angle: 120,
    radius: 42,
    tagline: "Stunning AI image creation",
  },
  {
    id: "dalle3",
    name: "DALL·E 3",
    ready: false,
    category: "image-gen",
    color: "rgba(249,115,22,0.12)",
    glowColor: "rgba(249,115,22,0.3)",
    textColor: "#fb923c",
    size: "small",
    angle: 140,
    radius: 56,
    tagline: "OpenAI's image generator",
  },
  {
    id: "stable-diffusion",
    name: "Stable Diffusion",
    ready: false,
    category: "image-gen",
    color: "rgba(139,92,246,0.12)",
    glowColor: "rgba(139,92,246,0.3)",
    textColor: "#c4b5fd",
    size: "small",
    angle: 105,
    radius: 56,
    tagline: "Open-source image AI",
  },
  {
    id: "canva-ai",
    name: "Canva AI",
    ready: false,
    category: "image-gen",
    color: "rgba(16,185,129,0.12)",
    glowColor: "rgba(16,185,129,0.3)",
    textColor: "#34d399",
    size: "small",
    angle: 155,
    radius: 46,
    tagline: "AI design for everyone",
  },
  // ── Video generation ──────────────────────────────────────────────────
  {
    id: "runway",
    name: "Runway",
    ready: false,
    category: "video-gen",
    color: "rgba(239,68,68,0.12)",
    glowColor: "rgba(239,68,68,0.3)",
    textColor: "#fca5a5",
    size: "medium",
    angle: 220,
    radius: 42,
    tagline: "AI video generation studio",
  },
  {
    id: "synthesia",
    name: "Synthesia",
    ready: false,
    category: "video-gen",
    color: "rgba(168,85,247,0.12)",
    glowColor: "rgba(168,85,247,0.3)",
    textColor: "#d8b4fe",
    size: "small",
    angle: 205,
    radius: 56,
    tagline: "AI video with avatars",
  },
  {
    id: "google-vids",
    name: "Google Vids",
    ready: false,
    category: "video-gen",
    color: "rgba(59,130,246,0.12)",
    glowColor: "rgba(59,130,246,0.3)",
    textColor: "#7dd3fc",
    size: "small",
    angle: 238,
    radius: 56,
    tagline: "Google's AI video creator",
  },
  // ── Audio generation ──────────────────────────────────────────────────
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    ready: false,
    category: "audio-gen",
    color: "rgba(245,158,11,0.12)",
    glowColor: "rgba(245,158,11,0.3)",
    textColor: "#fde68a",
    size: "medium",
    angle: 275,
    radius: 42,
    tagline: "AI voice and audio synthesis",
  },
  {
    id: "otter-ai",
    name: "Otter.ai",
    ready: false,
    category: "audio-gen",
    color: "rgba(20,184,166,0.12)",
    glowColor: "rgba(20,184,166,0.3)",
    textColor: "#5eead4",
    size: "small",
    angle: 295,
    radius: 56,
    tagline: "AI meeting transcription",
  },
  // ── Productivity ───────────────────────────────────────────────────────
  {
    id: "notion-ai",
    name: "Notion AI",
    ready: false,
    category: "productivity",
    color: "rgba(250,250,250,0.1)",
    glowColor: "rgba(250,250,250,0.25)",
    textColor: "rgba(250,250,250,0.7)",
    size: "medium",
    angle: 178,
    radius: 44,
    tagline: "AI-powered workspace",
  },
  {
    id: "gamma",
    name: "Gamma",
    ready: false,
    category: "productivity",
    color: "rgba(236,72,153,0.12)",
    glowColor: "rgba(236,72,153,0.3)",
    textColor: "#f472b6",
    size: "small",
    angle: 192,
    radius: 58,
    tagline: "AI presentation builder",
  },
  {
    id: "chatpdf",
    name: "ChatPDF",
    ready: false,
    category: "productivity",
    color: "rgba(239,68,68,0.12)",
    glowColor: "rgba(239,68,68,0.3)",
    textColor: "#fca5a5",
    size: "small",
    angle: 163,
    radius: 58,
    tagline: "Chat with your documents",
  },
  {
    id: "copyai",
    name: "Copy.ai",
    ready: false,
    category: "productivity",
    color: "rgba(99,102,241,0.12)",
    glowColor: "rgba(99,102,241,0.3)",
    textColor: "#a5b4fc",
    size: "small",
    angle: 60,
    radius: 60,
    tagline: "AI copywriting assistant",
  },
  {
    id: "jasper",
    name: "Jasper",
    ready: false,
    category: "productivity",
    color: "rgba(249,115,22,0.12)",
    glowColor: "rgba(249,115,22,0.3)",
    textColor: "#fdba74",
    size: "small",
    angle: 48,
    radius: 62,
    tagline: "AI marketing copywriter",
  },
  // ── Dev / ML ───────────────────────────────────────────────────────────
  {
    id: "huggingface",
    name: "Hugging Face",
    ready: false,
    category: "dev",
    color: "rgba(245,158,11,0.12)",
    glowColor: "rgba(245,158,11,0.3)",
    textColor: "#fcd34d",
    size: "small",
    angle: 76,
    radius: 60,
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
    angle: 88,
    radius: 64,
    tagline: "Run AI models in the cloud",
  },
];

export function getToolById(id: string): Tool | undefined {
  return TOOLS.find((t) => t.id === id);
}

export const READY_TOOLS = TOOLS.filter((t) => t.ready);
export const DEV_TOOLS   = TOOLS.filter((t) => !t.ready);

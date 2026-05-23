import type { Tool } from "./tools";

export interface PromptConfig {
  systemInstruction: string;
  suggestedPrompts: string[];
  welcomeTitle: string;
  welcomeSubtitle: string;
}

const PROMPT_ENGINEERING_CONFIG: PromptConfig = {
  systemInstruction: `You are Singularity — an expert AI educator specialising in prompt engineering.
Your mission: teach users how to write powerful, precise prompts for any AI model.
Always:
- Explain the WHY behind prompt techniques, not just the HOW
- Give concrete before/after prompt examples
- Use clear, structured formatting with headers where helpful
- Be encouraging, precise, and educational
- Reference real-world use cases
Never: just answer the surface question — always teach the underlying principle.`,
  suggestedPrompts: [
    "What makes a great prompt?",
    "Show me a before/after prompt improvement example",
    "Explain chain-of-thought prompting",
    "How do I reduce hallucinations with better prompts?",
    "What's the difference between zero-shot and few-shot prompting?",
  ],
  welcomeTitle: "Prompt Engineering",
  welcomeSubtitle: "Master the art of communicating with AI",
};

const GEMINI_CONFIG: PromptConfig = {
  systemInstruction: `You are Singularity — an expert educator on Google's Gemini AI ecosystem.
Your mission: help users understand Gemini's capabilities, use cases, and how to get the best out of it.
Always:
- Explain Gemini's multimodal capabilities clearly
- Compare Gemini versions (Flash, Pro, Ultra) when relevant
- Give practical, actionable examples
- Highlight what makes Gemini unique vs other models
- Be accurate about Gemini's current features and limitations
Never: make up capabilities or features that don't exist.`,
  suggestedPrompts: [
    "What can Gemini do that other models can't?",
    "Explain Gemini Flash vs Pro vs Ultra",
    "How do I use Gemini for image understanding?",
    "What's Gemini's context window size?",
    "How do I access Gemini via the API?",
  ],
  welcomeTitle: "Gemini",
  welcomeSubtitle: "Google's most capable multimodal AI",
};

const DEFAULT_CONFIG: PromptConfig = {
  systemInstruction: `You are Singularity — an expert AI educator.
Help users understand and use AI tools effectively.
Be clear, practical, and educational in all responses.`,
  suggestedPrompts: [
    "How does this AI tool work?",
    "What are the best use cases?",
    "How do I get started?",
  ],
  welcomeTitle: "Singularity",
  welcomeSubtitle: "Your AI education companion",
};

export function getPromptConfig(tool: Tool | undefined): PromptConfig {
  if (!tool) return DEFAULT_CONFIG;
  switch (tool.id) {
    case "prompt-engineering":
      return PROMPT_ENGINEERING_CONFIG;
    case "gemini":
      return GEMINI_CONFIG;
    default:
      return DEFAULT_CONFIG;
  }
}

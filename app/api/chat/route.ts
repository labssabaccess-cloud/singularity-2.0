import { GoogleGenAI } from "@google/genai";
import { getToolById } from "@/lib/tools";
import { getPromptConfig } from "@/lib/singularityPrompts";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

export async function POST(req: Request) {
  try {
    const { messages, toolId } = await req.json();

    const tool = getToolById(toolId);
    const config = getPromptConfig(tool);

    // Build history for multi-turn (all except last user message)
    const history = messages.slice(0, -1).map(
      (m: { role: string; content: string }) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })
    );

    const lastMessage = messages[messages.length - 1];

    const chat = ai.chats.create({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: config.systemInstruction,
        temperature: 0.8,
        maxOutputTokens: 1024,
      },
      history,
    });

    // Stream the response
    const stream = await chat.sendMessageStream({
      message: lastMessage.content,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[api/chat] error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

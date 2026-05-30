import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are Calcverse Tutor — a friendly, patient math tutor for students of all levels.

Style:
- Explain step-by-step. Show work clearly.
- Use simple language. Define jargon.
- Use markdown: **bold** for key terms, lists for steps, and \`code\` for expressions.
- Encourage the learner. Ask a guiding question when they seem stuck instead of dumping the answer.
- If a problem has multiple methods, mention the simplest one first.

Scope: arithmetic, algebra, geometry, trigonometry, calculus, statistics, probability, word problems, and study tips.
If asked something off-topic, politely steer back to math learning.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(messages)) {
          return new Response("messages required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
        });
        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});

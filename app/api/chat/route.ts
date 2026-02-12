import {
  streamText,
  type UIMessage,
  convertToModelMessages,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";

const LEARNHUB_SYSTEM_PROMPT = `You are the friendly AI assistant for LearnHub, an online course platform. Your role is to help visitors and students with questions about the platform.

LearnHub features:
- **Courses**: Browse and explore courses by category. Each course has lessons, duration, and enrollment count.
- **Students** can: sign up, log in, browse courses, enroll in courses (with progress tracking), save courses for later, and view their dashboard.
- **Admins** can: manage users (add, edit, delete; edit email, password, role), manage courses (add, edit, delete).
- **Navigation**: Home (/), Courses (/courses), Dashboard (/dashboard) when logged in, Saved (/saved), Login (/auth/login), Sign up (/auth/signup). Course detail pages are at /courses/[id], lessons at /courses/[id]/lessons/[lessonId].

Keep responses concise, helpful, and focused on the platform. If asked about something outside LearnHub (e.g., general knowledge), briefly answer but steer the conversation back to how LearnHub can help. Do not make up course names or URLs; suggest they browse the Courses page or use search.`;

function getModel() {
  // Try Groq first (generous free tier, no quota issues like Gemini free tier)
  if (process.env.GROQ_API_KEY) {
    return { model: groq("llama-3.3-70b-versatile"), provider: "groq" as const };
  }
  const geminiKey =
    process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (geminiKey) {
    return { model: google("gemini-2.0-flash"), provider: "gemini" as const };
  }
  if (process.env.OPENAI_API_KEY) {
    return { model: openai("gpt-4o-mini"), provider: "openai" as const };
  }
  return null;
}

export async function POST(req: Request) {
  const modelConfig = getModel();
  if (!modelConfig) {
    return Response.json(
      {
        error:
          "No AI provider configured. Add one of these to .env.local (all have free tiers): GEMINI_API_KEY, GROQ_API_KEY, or OPENAI_API_KEY.",
        code: "NO_PROVIDER",
      },
      { status: 503 }
    );
  }

  let body: { messages?: UIMessage[] };
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { messages } = body;
  if (!Array.isArray(messages)) {
    return Response.json(
      { error: "Missing or invalid messages" },
      { status: 400 }
    );
  }

  const result = streamText({
    model: modelConfig.model,
    system: LEARNHUB_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}

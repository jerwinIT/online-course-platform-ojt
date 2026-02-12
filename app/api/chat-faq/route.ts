import { NextResponse } from "next/server";

const FAQ: Array<{ keywords: string[]; reply: string }> = [
  {
    keywords: ["hello", "hi", "hey", "howdy"],
    reply:
      "Hi! I'm the LearnHub assistant. You can ask me about courses, how to sign up, enroll, save courses, or use your dashboard.",
  },
  {
    keywords: ["course", "courses", "browse", "find", "explore"],
    reply:
      "You can browse all courses at **/courses**. Each course shows duration, enrollment count, and category. Click **View Course** to see lessons and enroll.",
  },
  {
    keywords: ["enroll", "enrollment", "join", "take a course"],
    reply:
      "To enroll: go to **Courses**, open a course, then use **Enroll** on the course page. Your progress is saved automatically. You can continue from your **Dashboard**.",
  },
  {
    keywords: ["sign up", "register", "account", "create account"],
    reply:
      "Create an account at **/auth/signup**. After signing up you can browse courses, enroll, save courses, and track your progress.",
  },
  {
    keywords: ["login", "log in", "sign in"],
    reply: "Log in at **/auth/login** with your email and password.",
  },
  {
    keywords: ["dashboard"],
    reply:
      "Your **Dashboard** is at **/dashboard** when you're logged in. There you can see your enrolled courses and continue learning.",
  },
  {
    keywords: ["save", "saved", "bookmark", "later"],
    reply:
      "You can save courses for later from the course page. View all saved courses at **/saved**.",
  },
  {
    keywords: ["progress", "track", "continue", "resume"],
    reply:
      "LearnHub tracks your progress in each course. Open the course from your **Dashboard** or **/courses/[id]** and continue from where you left off. Lesson progress is saved automatically.",
  },
  {
    keywords: ["lesson", "lessons", "video", "watch"],
    reply:
      "Lessons are inside each course. Open a course and go to **/courses/[courseId]/lessons/[lessonId]** to watch and complete lessons.",
  },
  {
    keywords: ["admin", "manage", "user", "instructor"],
    reply:
      "Admins can manage users (add, edit, delete, change email/password/role) and manage courses (add, edit, delete). Admin features are in the **/admin** area.",
  },
  {
    keywords: ["category", "categories"],
    reply:
      "Courses are organized by categories. You can filter or browse by category on the **Courses** page.",
  },
  {
    keywords: ["help", "support", "what can you do"],
    reply:
      "I can help with: finding courses, signing up, logging in, enrolling, saving courses, your dashboard, progress, and admin features. Just ask in your own words!",
  },
];

function getFaqReply(userMessage: string): string {
  const lower = userMessage.toLowerCase().trim();
  for (const { keywords, reply } of FAQ) {
    if (keywords.some((k) => lower.includes(k))) return reply;
  }
  return "I can help with LearnHub: courses, enrollment, sign up, login, dashboard, saved courses, and progress. Try asking something like \"How do I enroll?\" or \"Where is my dashboard?\"";
}

export async function POST(req: Request) {
  let body: { message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const reply = getFaqReply(message || "help");
  return NextResponse.json({ reply });
}

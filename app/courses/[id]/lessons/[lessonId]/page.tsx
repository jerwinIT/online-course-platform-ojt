import { Suspense } from "react";
import LessonPlayerContent from "@/components/contents/lesson-player";
import { getLessonPlayerData } from "@/server/actions/lessonPlayer";

// ─── Async fetcher ─────────────────────────────────────────────────────────────

async function LessonPlayerFetcher({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) {
  const data = await getLessonPlayerData(courseId, lessonId);
  return <LessonPlayerContent data={data} />;
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function LessonPlayerPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  // Next.js 15: params is a Promise
  const { id, lessonId } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading lesson…</p>
          </div>
        </div>
      }
    >
      <LessonPlayerFetcher courseId={id} lessonId={lessonId} />
    </Suspense>
  );
}

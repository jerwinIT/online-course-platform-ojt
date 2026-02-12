import { Suspense } from "react";
import CourseDetailContent from "@/components/contents/course-detail";
import { getCourseDetailData } from "@/server/actions/courseDetail";

// ─── Async fetcher (runs inside Suspense) ──────────────────────────────────────

async function CourseDetailFetcher({ id }: { id: string }) {
  const data = await getCourseDetailData(id);
  return <CourseDetailContent data={data} />;
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 15: params is a Promise
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading course…</p>
          </div>
        </div>
      }
    >
      <CourseDetailFetcher id={id} />
    </Suspense>
  );
}

"use client";

import { useState, useTransition, useOptimistic } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SaveButton } from "@/components/save-button";
import {
  Users,
  Clock,
  BookOpen,
  Award,
  Share2,
  PlayCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Footer from "@/components/footer";
import { formatDuration } from "@/lib/utils/format";
import {
  enrollInCourse,
  toggleLessonComplete,
} from "@/server/actions/courseDetail";
import type { CourseDetailData } from "@/server/actions/courseDetail";

// ─── Enroll Button ─────────────────────────────────────────────────────────────

function EnrollButton({
  courseId,
  isAuthenticated,
  isEnrolled,
}: {
  courseId: string;
  isAuthenticated: boolean;
  isEnrolled: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (isEnrolled) {
    return (
      <Button className="w-full" size="lg" variant="secondary" disabled>
        <CheckCircle2 className="w-4 h-4 mr-2" />
        Enrolled
      </Button>
    );
  }

  function handleEnroll() {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await enrollInCourse(courseId);
      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button
        className="w-full"
        size="lg"
        onClick={handleEnroll}
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Enrolling…
          </>
        ) : isAuthenticated ? (
          "Enroll Now"
        ) : (
          "Sign Up to Enroll"
        )}
      </Button>
      {error && <p className="text-sm text-destructive text-center">{error}</p>}
    </div>
  );
}

// ─── Progress Bar ──────────────────────────────────────────────────────────────

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Your progress</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
        <div
          className="bg-primary h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ─── Share Button ──────────────────────────────────────────────────────────────

function ShareButton({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const [shareState, setShareState] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  async function handleShare() {
    const url = window.location.href;

    // Use the native Web Share API when available (mobile / modern browsers)
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
      } catch {
        // User cancelled — treat as a no-op
      }
      return;
    }

    // Fallback: copy the URL to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2000);
    } catch {
      setShareState("error");
      setTimeout(() => setShareState("idle"), 2000);
    }
  }

  const label =
    shareState === "copied"
      ? "Copied!"
      : shareState === "error"
        ? "Failed"
        : "Share";

  return (
    <Button
      variant="outline"
      className="flex-1 gap-2 bg-transparent"
      onClick={handleShare}
    >
      <Share2 className="w-4 h-4" />
      {label}
    </Button>
  );
}

// ─── Lesson Row ────────────────────────────────────────────────────────────────

function LessonRow({
  lesson,
  courseId,
  isEnrolled,
}: {
  lesson: CourseDetailData["sections"][number]["lessons"][number];
  courseId: string;
  isEnrolled: boolean;
}) {
  const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(
    lesson.completed,
  );
  const [isPending, startTransition] = useTransition();

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      setOptimisticCompleted(checked);
      await toggleLessonComplete(lesson.id, courseId, checked);
    });
  }

  return (
    <div className="flex items-center justify-between py-3 gap-3">
      {/* Left: checkbox (enrolled) or play icon (not enrolled) + title */}
      <div className="flex items-center gap-3 min-w-0">
        {isEnrolled ? (
          <Checkbox
            id={lesson.id}
            checked={optimisticCompleted}
            onCheckedChange={(v) => handleToggle(Boolean(v))}
            disabled={isPending}
            className="flex-shrink-0"
          />
        ) : (
          <PlayCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
        <label
          htmlFor={isEnrolled ? lesson.id : undefined}
          className={`text-sm select-none truncate ${
            isEnrolled ? "cursor-pointer" : ""
          } ${optimisticCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}
        >
          {lesson.title}
        </label>
      </div>

      {/* Right: duration + watch button */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {lesson.duration > 0 && (
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {formatDuration(lesson.duration)}
          </span>
        )}
        {isEnrolled ? (
          <Link href={`/courses/${courseId}/lessons/${lesson.id}`}>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 gap-1 text-xs"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              Watch
            </Button>
          </Link>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 gap-1 text-xs text-muted-foreground"
            disabled
          >
            <PlayCircle className="w-3.5 h-3.5" />
            Watch
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CourseDetailContent({
  data,
}: {
  data: CourseDetailData;
}) {
  const {
    id,
    title,
    subtitle,
    description,
    image,
    duration,
    totalLessons,
    totalMinutes,
    totalEnrollments,
    category,
    sections,
    isAuthenticated,
    isEnrolled,
    isSaved,
    progress,
  } = data;

  const displayDuration = formatDuration(totalMinutes || duration);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 border-b border-border px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/courses"
            className="text-primary hover:underline text-sm mb-4 inline-block"
          >
            ← Back to Courses
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: course meta */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-3">
                <Badge className="w-fit">{category.name}</Badge>
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground text-balance">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xl text-muted-foreground">{subtitle}</p>
                )}
              </div>

              <p className="text-lg text-muted-foreground">{description}</p>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-5 h-5" />
                  <span>
                    {totalEnrollments > 0
                      ? totalEnrollments >= 1000
                        ? `${(totalEnrollments / 1000).toFixed(1)}K students`
                        : `${totalEnrollments} students`
                      : "Be the first to enroll!"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-5 h-5" />
                  <span>{displayDuration}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="w-5 h-5" />
                  <span>{totalLessons} lessons</span>
                </div>
              </div>
            </div>

            {/* Right: sticky enroll card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                {image ? (
                  <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={image}
                      alt={title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-primary/10 to-accent/10 h-40 flex items-center justify-center rounded-t-lg">
                    <BookOpen className="w-12 h-12 text-primary opacity-40" />
                  </div>
                )}

                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>
                        {totalEnrollments > 0
                          ? `${totalEnrollments.toLocaleString()} enrolled`
                          : "Be the first to enroll!"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{displayDuration} of content</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <PlayCircle className="w-4 h-4" />
                      <span>{totalLessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Award className="w-4 h-4" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>

                  {/* Progress bar — only visible when enrolled */}
                  {isEnrolled && <ProgressBar progress={progress} />}

                  <EnrollButton
                    courseId={id}
                    isAuthenticated={isAuthenticated}
                    isEnrolled={isEnrolled}
                  />

                  <div className="flex gap-2">
                    <SaveButton
                      courseId={id}
                      initialIsSaved={isSaved}
                      variant="outline"
                      className="flex-1 gap-2 bg-transparent"
                    />
                    <ShareButton title={title} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Body                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* About */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              About this course
            </h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-border p-4 text-center space-y-1">
              <Users className="w-6 h-6 text-primary mx-auto" />
              <p className="font-bold text-lg text-foreground">
                {totalEnrollments.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Students</p>
            </div>
            <div className="rounded-lg border border-border p-4 text-center space-y-1">
              <BookOpen className="w-6 h-6 text-primary mx-auto" />
              <p className="font-bold text-lg text-foreground">
                {totalLessons}
              </p>
              <p className="text-xs text-muted-foreground">Lessons</p>
            </div>
            <div className="rounded-lg border border-border p-4 text-center space-y-1">
              <Clock className="w-6 h-6 text-primary mx-auto" />
              <p className="font-bold text-lg text-foreground">
                {displayDuration}
              </p>
              <p className="text-xs text-muted-foreground">Duration</p>
            </div>
          </div>

          {/* Curriculum */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Course Curriculum
              </h2>
              <p className="text-sm text-muted-foreground">
                {sections.length} sections • {totalLessons} lessons •{" "}
                {displayDuration} total
              </p>
            </div>

            <div className="space-y-3">
              {sections.map((section, i) => {
                const sectionMinutes = section.lessons.reduce(
                  (t, l) => t + (l.duration ?? 0),
                  0,
                );
                const sectionCompleted = section.lessons.filter(
                  (l) => l.completed,
                ).length;

                return (
                  <Card key={section.id} className="overflow-hidden">
                    <CardHeader className="pb-3 bg-muted/30">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">
                            <span className="text-muted-foreground mr-2 text-sm">
                              Section {i + 1}
                            </span>
                            {section.title}
                          </CardTitle>
                          <CardDescription>
                            {section.lessons.length} lesson
                            {section.lessons.length !== 1 ? "s" : ""}
                            {sectionMinutes > 0 &&
                              ` • ${formatDuration(sectionMinutes)}`}
                            {isEnrolled && section.lessons.length > 0 && (
                              <span className="ml-2 text-primary font-medium">
                                {sectionCompleted}/{section.lessons.length} done
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        {/* Section-level completion badge */}
                        {isEnrolled &&
                          sectionCompleted === section.lessons.length &&
                          section.lessons.length > 0 && (
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          )}
                      </div>
                    </CardHeader>

                    {section.lessons.length > 0 && (
                      <CardContent className="pt-0 divide-y divide-border">
                        {section.lessons.map((lesson) => (
                          <LessonRow
                            key={lesson.id}
                            lesson={lesson}
                            courseId={id}
                            isEnrolled={isEnrolled}
                          />
                        ))}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

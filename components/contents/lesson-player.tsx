"use client";

import { useState, useTransition, useOptimistic } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  PlayCircle,
  Clock,
  BookOpen,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";
import { formatDuration } from "@/lib/utils/format";
import { toggleLessonCompleteFromPlayer } from "@/server/actions/lessonPlayer";
import type {
  LessonPlayerData,
  LessonNavItem,
} from "@/server/actions/lessonPlayer";

// ─── Video Player Mock ─────────────────────────────────────────────────────────

function VideoPlayer({ 
  title, 
  duration, 
  videoUrl 
}: { 
  title: string; 
  duration: number;
  videoUrl: string | null;
}) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  function handleScrub(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setProgress(pct);
  }

  // Extract video ID and type from URL
  const getVideoEmbedUrl = (url: string | null) => {
    if (!url) return null;

    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=0&rel=0`;
    }

    // Vimeo
    const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // Direct video URL (mp4, webm, etc.)
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return url;
    }

    // Default: treat as direct embed URL
    return url;
  };

  const embedUrl = getVideoEmbedUrl(videoUrl);
  const isDirectVideo = embedUrl && embedUrl.match(/\.(mp4|webm|ogg)$/i);

  // If there's a valid video URL, show embedded player
  if (embedUrl) {
    return (
      <div className="w-full bg-black rounded-xl overflow-hidden shadow-2xl">
        <div className="relative aspect-video">
          {isDirectVideo ? (
            // Direct video file
            <video
              className="w-full h-full"
              controls
              controlsList="nodownload"
              preload="metadata"
            >
              <source src={embedUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            // Embedded iframe (YouTube, Vimeo, etc.)
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title}
            />
          )}
        </div>
      </div>
    );
  }

  // Fallback: Mock player if no video URL
  return (
    <div className="w-full bg-black rounded-xl overflow-hidden shadow-2xl">
      {/* Video viewport */}
      <div className="relative aspect-video bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center group">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />

        {/* Fake video noise texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* No video message */}
        <div className="relative z-10 text-center space-y-3 px-4">
          <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto">
            <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <p className="text-white/60 text-sm">No video available for this lesson</p>
        </div>

        {/* Lesson title overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <p className="text-white text-sm font-medium truncate">{title}</p>
        </div>
      </div>

      {/* Controls bar (disabled when no video) */}
      <div className="bg-zinc-900 px-4 py-3 space-y-2 opacity-50">
        {/* Scrubber */}
        <div className="w-full h-1.5 bg-zinc-700 rounded-full relative">
          <div className="h-full bg-zinc-600 rounded-full w-0" />
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-zinc-400">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 ml-0.5"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-zinc-400 text-xs tabular-nums">
              0s / {formatDuration(duration) !== "—" ? formatDuration(duration) : "—"}
            </span>
          </div>

          {/* Volume + fullscreen mock */}
          <div className="flex items-center gap-3">
            <div className="text-zinc-400">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
            </div>
            <div className="text-zinc-400">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar Lesson Item ───────────────────────────────────────────────────────

function SidebarLessonItem({
  lesson,
  courseId,
  isActive,
}: {
  lesson: LessonNavItem;
  courseId: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={`/courses/${courseId}/lessons/${lesson.id}`}
      className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
        isActive
          ? "bg-primary/10 border border-primary/20"
          : "hover:bg-muted/60"
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {lesson.completed ? (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        ) : (
          <PlayCircle
            className={`w-4 h-4 ${
              isActive
                ? "text-primary"
                : "text-muted-foreground group-hover:text-foreground"
            }`}
          />
        )}
      </div>
      <div className="min-w-0">
        <p
          className={`text-sm leading-snug truncate ${
            isActive ? "text-primary font-medium" : "text-foreground"
          } ${lesson.completed ? "line-through text-muted-foreground" : ""}`}
        >
          {lesson.title}
        </p>
        {lesson.sectionTitle && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {lesson.sectionTitle}
          </p>
        )}
      </div>
    </Link>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function LessonPlayerContent({
  data,
}: {
  data: LessonPlayerData;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(
    data.completed,
  );
  const [isPending, startTransition] = useTransition();

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      setOptimisticCompleted(checked);
      await toggleLessonCompleteFromPlayer(
        data.lesson.id,
        data.courseId,
        checked,
      );
    });
  }

  function goNext() {
    if (data.nextLesson) {
      router.push(`/courses/${data.courseId}/lessons/${data.nextLesson.id}`);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Top Nav ── */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 gap-3">
          {/* Left: back + course title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link href={`/courses/${data.courseId}`}>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="min-w-0 hidden sm:block">
              <Link
                href={`/courses/${data.courseId}`}
                className="text-sm font-medium text-foreground hover:text-primary transition truncate block"
              >
                {data.courseTitle}
              </Link>
              <p className="text-xs text-muted-foreground truncate">
                {data.lesson.sectionTitle}
              </p>
            </div>
          </div>

          {/* Center: progress */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2 ">
              <div className="w-24 bg-secondary rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${data.progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {data.completedCount}/{data.totalCount}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs tabular-nums">
              {data.progress}%
            </Badge>
          </div>

          {/* Right: sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 lg:hidden"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle lesson list"
          >
            {sidebarOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 space-y-6">
            {/* Video */}
            <VideoPlayer
              title={data.lesson.title}
              duration={data.lesson.duration}
              videoUrl={data.lesson.videoUrl}
            />

            {/* Lesson header + actions */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground">
                  {data.lesson.title}
                </h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {data.lesson.sectionTitle}
                  </span>
                  {data.lesson.duration > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDuration(data.lesson.duration)}
                    </span>
                  )}
                </div>
              </div>

              {/* Mark complete checkbox */}
              <div className="flex items-center gap-2.5 bg-muted/50 border border-border rounded-lg px-4 py-2.5 flex-shrink-0">
                <Checkbox
                  id="mark-complete"
                  checked={optimisticCompleted}
                  onCheckedChange={(v) => handleToggle(Boolean(v))}
                  disabled={isPending}
                />
                <label
                  htmlFor="mark-complete"
                  className="text-sm font-medium cursor-pointer select-none whitespace-nowrap"
                >
                  {optimisticCompleted ? "Completed ✓" : "Mark as complete"}
                </label>
              </div>
            </div>

            {/* Lesson content / notes */}
            {data.lesson.content && (
              <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 rounded-xl p-6 border border-border">
                <h2 className="text-base font-semibold text-foreground mb-3">
                  Lesson Notes
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {data.lesson.content}
                </p>
              </div>
            )}

            {/* Prev / Next navigation */}
            <div className="flex items-center justify-between pt-2 pb-8">
              {data.prevLesson ? (
                <Link
                  href={`/courses/${data.courseId}/lessons/${data.prevLesson.id}`}
                >
                  <Button variant="outline" className="gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </Button>
                </Link>
              ) : (
                <div />
              )}

              {data.nextLesson ? (
                <Button onClick={goNext} className="gap-2">
                  <span>Next Lesson</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Link href={`/courses/${data.courseId}`}>
                  <Button variant="secondary" className="gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Back to Course
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </main>

        {/* ── Sidebar playlist (desktop always visible, mobile slide-in) ── */}
        <aside
          className={`
            fixed inset-y-0 right-0 z-30 w-80 bg-background border-l border-border
            transform transition-transform duration-300 ease-in-out pt-14
            lg:static lg:translate-x-0 lg:pt-0 lg:flex lg:flex-col
            ${sidebarOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >
          {/* Sidebar header */}
          <div className="px-4 py-4 border-b border-border flex-shrink-0">
            <h2 className="font-semibold text-foreground text-sm">
              Course Content
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {data.completedCount} of {data.totalCount} lessons completed
            </p>
            {/* Sidebar progress bar */}
            <div className="w-full bg-secondary rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${data.progress}%` }}
              />
            </div>
          </div>

          {/* Lesson list */}
          <ScrollArea className="flex-1">
            <div className="px-3 py-3 space-y-0.5">
              {data.allLessons.map((lesson) => (
                <SidebarLessonItem
                  key={lesson.id}
                  lesson={lesson}
                  courseId={data.courseId}
                  isActive={lesson.id === data.lesson.id}
                />
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Mobile sidebar overlay backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
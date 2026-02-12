"use server";

import { getSession } from "@/server/actions/getSession";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type LessonNavItem = {
  id: string;
  title: string;
  order: number;
  sectionTitle: string;
  completed: boolean;
};

export type LessonPlayerData = {
  courseId: string;
  courseTitle: string;
  lesson: {
    id: string;
    title: string;
    content: string;
    videoUrl: string | null;
    duration: number;
    order: number;
    sectionTitle: string;
  };
  prevLesson: LessonNavItem | null;
  nextLesson: LessonNavItem | null;
  allLessons: LessonNavItem[]; // for the sidebar playlist
  completed: boolean;
  progress: number; // overall course progress 0-100
  completedCount: number;
  totalCount: number;
};

// ─── Fetch ─────────────────────────────────────────────────────────────────────

export async function getLessonPlayerData(
  courseId: string,
  lessonId: string,
): Promise<LessonPlayerData> {
  const session = await getSession();

  if (!session?.user) {
    redirect("/");
  }

  const userId = session.user.id;

  // Must be enrolled to access lesson player
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (!enrollment) {
    redirect(`/courses/${courseId}`);
  }

  const [course, progressRecords] = await Promise.all([
    prisma.course.findUnique({
      where: { id: courseId, isPublished: true },
      select: {
        id: true,
        title: true,
        sections: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            order: true,
            lessons: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
                content: true,
                videoUrl: true,
                duration: true,
                order: true,
              },
            },
          },
        },
      },
    }),
    prisma.progress.findMany({
      where: {
        userId,
        completed: true,
        lesson: { section: { courseId } },
      },
      select: { lessonId: true },
    }),
  ]);

  if (!course) {
    redirect("/courses");
  }

  const completedSet = new Set(progressRecords.map((p) => p.lessonId));

  // Flatten all lessons in order with their section title
  const allLessons: LessonNavItem[] = course.sections.flatMap((section) =>
    section.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      order: lesson.order,
      sectionTitle: section.title,
      completed: completedSet.has(lesson.id),
    })),
  );

  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);

  if (currentIndex === -1) {
    redirect(`/courses/${courseId}`);
  }

  // Find the actual lesson with content from the sections tree
  const lessonRaw = course.sections
    .flatMap((s) => s.lessons.map((l) => ({ ...l, sectionTitle: s.title })))
    .find((l) => l.id === lessonId)!;

  return {
    courseId: course.id,
    courseTitle: course.title,
    lesson: {
      id: lessonRaw.id,
      title: lessonRaw.title,
      content: lessonRaw.content,
      videoUrl: lessonRaw.videoUrl,
      duration: lessonRaw.duration,
      order: lessonRaw.order,
      sectionTitle: lessonRaw.sectionTitle,
    },
    prevLesson: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
    nextLesson:
      currentIndex < allLessons.length - 1
        ? allLessons[currentIndex + 1]
        : null,
    allLessons,
    completed: completedSet.has(lessonId),
    progress:
      allLessons.length > 0
        ? Math.round((completedSet.size / allLessons.length) * 100)
        : 0,
    completedCount: completedSet.size,
    totalCount: allLessons.length,
  };
}

// ─── Toggle (re-exported for lesson player page) ───────────────────────────────

export async function toggleLessonCompleteFromPlayer(
  lessonId: string,
  courseId: string,
  completed: boolean,
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();

  if (!session?.user) {
    return { success: false, error: "Not authenticated." };
  }

  const userId = session.user.id;

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (!enrollment) {
    return { success: false, error: "Not enrolled." };
  }

  try {
    await prisma.progress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        completed,
        completedAt: completed ? new Date() : null,
      },
      update: { completed, completedAt: completed ? new Date() : null },
    });

    revalidatePath(`/courses/${courseId}/lessons/${lessonId}`);
    revalidatePath(`/courses/${courseId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update progress." };
  }
}

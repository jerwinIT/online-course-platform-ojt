"use server";

import { getSession } from "@/server/actions/getSession";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

// ─── Auth helper (soft — returns null if unauthenticated) ──────────────────────
// Course detail page is public; we still want to know who's viewing it.

async function getOptionalUser() {
  const session = await getSession();
  return session?.user ?? null;
}

// ─── Types ─────────────────────────────────────────────────────────────────────

export type LessonDetail = {
  id: string;
  title: string;
  duration: number;
  order: number;
  completed: boolean; // always false when not enrolled
};

export type SectionDetail = {
  id: string;
  title: string;
  order: number;
  lessons: LessonDetail[];
};

export type CourseDetailData = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  image: string | null;
  duration: number;
  totalLessons: number;
  totalMinutes: number;
  totalEnrollments: number;
  category: { id: string; name: string };
  instructor: { name: string | null };
  sections: SectionDetail[];
  // viewer state
  isAuthenticated: boolean;
  isEnrolled: boolean;
  isSaved: boolean;
  completedLessonIds: string[];
  progress: number; // 0-100
};

// ─── Fetch ─────────────────────────────────────────────────────────────────────

export async function getCourseDetailData(
  courseId: string,
): Promise<CourseDetailData> {
  const user = await getOptionalUser();

  const [course, enrollment, savedRecord, progressRecords] = await Promise.all([
    prisma.course.findUnique({
      where: { id: courseId, isPublished: true },
      include: {
        category: { select: { id: true, name: true } },
        createdBy: { select: { name: true } },
        sections: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              select: { id: true, title: true, duration: true, order: true },
            },
          },
        },
        _count: { select: { enrollments: true } },
      },
    }),
    user
      ? prisma.enrollment.findUnique({
          where: { userId_courseId: { userId: user.id, courseId } },
        })
      : null,
    user
      ? prisma.savedCourse.findUnique({
          where: { userId_courseId: { userId: user.id, courseId } },
        })
      : null,
    user
      ? prisma.progress.findMany({
          where: {
            userId: user.id,
            completed: true,
            lesson: { section: { courseId } },
          },
          select: { lessonId: true },
        })
      : [],
  ]);

  if (!course) {
    redirect("/courses");
  }

  const completedLessonIds = (progressRecords as { lessonId: string }[]).map(
    (p) => p.lessonId,
  );
  const completedSet = new Set(completedLessonIds);

  const sections: SectionDetail[] = course.sections.map((section) => ({
    id: section.id,
    title: section.title,
    order: section.order,
    lessons: section.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      duration: lesson.duration,
      order: lesson.order,
      completed: completedSet.has(lesson.id),
    })),
  }));

  const totalLessons = sections.reduce((s, sec) => s + sec.lessons.length, 0);
  const totalMinutes = sections.reduce(
    (s, sec) => s + sec.lessons.reduce((t, l) => t + (l.duration ?? 0), 0),
    0,
  );
  const progress =
    totalLessons > 0
      ? Math.round((completedLessonIds.length / totalLessons) * 100)
      : 0;

  return {
    id: course.id,
    title: course.title,
    subtitle: course.subtitle,
    description: course.description,
    image: course.image,
    duration: course.duration,
    totalLessons,
    totalMinutes,
    totalEnrollments: course._count.enrollments,
    category: course.category,
    instructor: { name: course.createdBy.name },
    sections,
    isAuthenticated: !!user,
    isEnrolled: !!enrollment,
    isSaved: !!savedRecord,
    completedLessonIds,
    progress,
  };
}

// ─── Enroll ────────────────────────────────────────────────────────────────────

export async function enrollInCourse(
  courseId: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signup");
  }

  const userId = session.user.id;

  try {
    // Verify course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId, isPublished: true },
      select: { id: true },
    });

    if (!course) {
      return { success: false, error: "Course not found." };
    }

    // Upsert — idempotent, safe to call twice
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId },
      update: {},
    });

    revalidatePath(`/courses/${courseId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to enroll. Please try again." };
  }
}

// ─── Toggle lesson completion ──────────────────────────────────────────────────

export async function toggleLessonComplete(
  lessonId: string,
  courseId: string,
  completed: boolean,
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();

  if (!session?.user) {
    return { success: false, error: "Not authenticated." };
  }

  const userId = session.user.id;

  // Guard: must be enrolled
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (!enrollment) {
    return { success: false, error: "You are not enrolled in this course." };
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
      update: {
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    revalidatePath(`/courses/${courseId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update progress." };
  }
}

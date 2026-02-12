"use server";

import { getSession } from "@/server/actions/getSession";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

// ─── Auth guard ────────────────────────────────────────────────────────────────

async function getAuthenticatedStudent() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  return session.user;
}

// ─── Types ─────────────────────────────────────────────────────────────────────

export type EnrolledCourse = {
  id: string;
  title: string;
  subtitle: string | null;
  image: string | null;
  instructorName: string | null;
  totalLessons: number;
  completedLessons: number;
  progress: number;
  enrolledAt: Date;
};

export type DashboardStats = {
  coursesEnrolled: number;
  completedLessons: number;
  totalLessons: number;
  avgProgress: number;
  learningMinutes: number;
};

export type Certificate = {
  courseId: string;
  courseTitle: string;
  completedAt: Date | null;
};

export type DashboardData = {
  stats: DashboardStats;
  enrolledCourses: EnrolledCourse[];
  certificates: Certificate[];
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

// ─── Main data fetch ────────────────────────────────────────────────────────────

export async function getDashboardData(): Promise<DashboardData> {
  const sessionUser = await getAuthenticatedStudent();

  const [enrollments, progressRecords] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: sessionUser.id },
      include: {
        course: {
          include: {
            createdBy: { select: { name: true } },
            sections: {
              include: {
                lessons: { select: { id: true, duration: true } },
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    }),
    prisma.progress.findMany({
      where: { userId: sessionUser.id, completed: true },
      include: {
        lesson: { select: { id: true, duration: true, sectionId: true } },
      },
    }),
  ]);

  const completedLessonIds = new Set(progressRecords.map((p) => p.lessonId));

  // Build per-course data
  const enrolledCourses: EnrolledCourse[] = enrollments.map(
    ({ course, enrolledAt }) => {
      const allLessons = course.sections.flatMap((s) => s.lessons);
      const totalLessons = allLessons.length;
      const completedLessons = allLessons.filter((l) =>
        completedLessonIds.has(l.id),
      ).length;
      const progress =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      return {
        id: course.id,
        title: course.title,
        subtitle: course.subtitle,
        image: course.image,
        instructorName: course.createdBy.name,
        totalLessons,
        completedLessons,
        progress,
        enrolledAt,
      };
    },
  );

  // Aggregate stats
  const totalLessons = enrolledCourses.reduce((s, c) => s + c.totalLessons, 0);
  const completedLessonsCount = enrolledCourses.reduce(
    (s, c) => s + c.completedLessons,
    0,
  );
  const avgProgress =
    enrolledCourses.length > 0
      ? Math.round(
          enrolledCourses.reduce((s, c) => s + c.progress, 0) /
            enrolledCourses.length,
        )
      : 0;

  // Learning minutes: sum of completed lesson durations
  const completedLessonDurations = progressRecords.reduce(
    (sum, p) => sum + (p.lesson.duration ?? 0),
    0,
  );

  // Certificates: courses at 100% progress
  const certificates: Certificate[] = enrolledCourses
    .filter((c) => c.progress === 100)
    .map((c) => {
      // Find the latest completedAt for this course's lessons
      const courseLessonIds =
        enrollments
          .find((e) => e.courseId === c.id)
          ?.course.sections.flatMap((s) => s.lessons.map((l) => l.id)) ?? [];

      const completionDates = progressRecords
        .filter((p) => courseLessonIds.includes(p.lessonId) && p.completedAt)
        .map((p) => p.completedAt as Date);

      const latestCompletion =
        completionDates.length > 0
          ? completionDates.reduce((a, b) => (a > b ? a : b))
          : null;

      return {
        courseId: c.id,
        courseTitle: c.title,
        completedAt: latestCompletion,
      };
    });

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    select: { id: true, name: true, email: true, image: true },
  });

  return {
    stats: {
      coursesEnrolled: enrolledCourses.length,
      completedLessons: completedLessonsCount,
      totalLessons,
      avgProgress,
      learningMinutes: completedLessonDurations,
    },
    enrolledCourses,
    certificates,
    user,
  };
}

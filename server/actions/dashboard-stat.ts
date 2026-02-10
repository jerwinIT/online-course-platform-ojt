// app/actions/dashboard-stats.ts
"use server";

import prisma from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";

// ---------------------------------------------------------------------------
// getDashboardStats
// Unchanged — no lesson relation involved.
// ---------------------------------------------------------------------------

export async function getDashboardStats() {
  const [totalStudents, totalCourses, totalEnrollments] = await Promise.all([
    prisma.user.count({
      where: { role: Role.STUDENT, isActive: true },
    }),
    prisma.course.count(),
    prisma.enrollment.count(),
  ]);

  return { totalStudents, totalCourses, totalEnrollments };
}

// ---------------------------------------------------------------------------
// getAdminCourses
//
// FIX: `lessons` is no longer a direct relation on Course — it now lives
// under Section.  We can't use `_count: { select: { lessons: true } }`
// on Course anymore.
//
// Solution: select `sections` with their own `_count.lessons` and sum
// them up in JS.  This is a single query and avoids raw SQL.
// ---------------------------------------------------------------------------

export interface AdminCourseItem {
  id: string;
  title: string;
  description: string;
  createdAt: Date | string;
  sectionCount: number; // new — exposed for UI convenience
  lessonCount: number;
  enrollmentCount: number;
  averageRating: number | null;
}

export async function getAdminCourses(): Promise<AdminCourseItem[]> {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      // ↓ Count enrollments and ratings directly on Course (still valid)
      _count: { select: { enrollments: true, ratings: true } },
      // ↓ Fetch each section's own lesson count instead of a flat lessons count
      sections: {
        select: {
          _count: { select: { lessons: true } },
        },
      },
      ratings: { select: { rating: true } },
    },
  });

  return courses.map((c) => {
    // Sum lesson counts across all sections
    const lessonCount = c.sections.reduce(
      (sum, section) => sum + section._count.lessons,
      0,
    );

    const avg =
      c.ratings.length > 0
        ? c.ratings.reduce((s, r) => s + r.rating, 0) / c.ratings.length
        : null;

    return {
      id: c.id,
      title: c.title,
      description: c.description,
      createdAt: c.createdAt,
      sectionCount: c.sections.length,
      lessonCount,
      enrollmentCount: c._count.enrollments,
      averageRating: avg != null ? Math.round(avg * 10) / 10 : null,
    };
  });
}

// ---------------------------------------------------------------------------
// getAdminUsers
// Unchanged — no lesson relation involved.
// ---------------------------------------------------------------------------

export interface AdminUserItem {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  enrollmentCount: number;
  createdAt: Date | string;
  isActive: boolean;
}

export async function getAdminUsers(): Promise<AdminUserItem[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      isActive: true,
      _count: { select: { enrollments: true } },
    },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    enrollmentCount: u._count.enrollments,
    createdAt: u.createdAt,
    isActive: u.isActive,
  }));
}

// ---------------------------------------------------------------------------
// getRecentEnrollments
// Unchanged — no lesson relation involved.
// ---------------------------------------------------------------------------

export async function getRecentEnrollments() {
  return prisma.enrollment.findMany({
    orderBy: { enrolledAt: "desc" },
    take: 5,
    include: {
      user: { select: { id: true, name: true } },
      course: { select: { id: true, title: true } },
    },
  });
}

// ---------------------------------------------------------------------------
// getPlatformPerformance
//
// FIX: The completion rate was calculated as:
//   completedProgressCount / sum(course._count.lessons)
//
// Since lessons are now nested under sections, `course._count.lessons`
// no longer exists.  We need the total lesson count per course via sections.
//
// Solution: fetch sections with their lesson counts in the same query,
// then derive totalPossibleCompletions the same way as getAdminCourses.
// ---------------------------------------------------------------------------

export interface PlatformPerformance {
  averageCourseRating: number | null;
  completionRate: number | null;
  studentSatisfaction: number | null;
  monthlyGrowth: number | null;
}

export async function getPlatformPerformance(): Promise<PlatformPerformance> {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    completedProgressCount,
    // ↓ FIX: fetch section-level lesson counts instead of course-level
    sectionsWithLessonCounts,
    enrollmentsThisMonth,
    enrollmentsLastMonth,
    ratingAggregate,
  ] = await Promise.all([
    prisma.progress.count({ where: { completed: true } }),

    // One row per section; we only need the lesson count
    prisma.section.findMany({
      select: {
        _count: { select: { lessons: true } },
      },
    }),

    prisma.enrollment.count({
      where: { enrolledAt: { gte: startOfThisMonth } },
    }),

    prisma.enrollment.count({
      where: {
        enrolledAt: { gte: startOfLastMonth, lt: startOfThisMonth },
      },
    }),

    prisma.courseRating.aggregate({
      _avg: { rating: true },
      _count: { id: true },
    }),
  ]);

  // Total lessons across the entire platform
  const totalPossibleCompletions = sectionsWithLessonCounts.reduce(
    (sum, s) => sum + s._count.lessons,
    0,
  );

  const completionRate =
    totalPossibleCompletions > 0
      ? Math.round((completedProgressCount / totalPossibleCompletions) * 100)
      : null;

  const monthlyGrowth =
    enrollmentsLastMonth > 0
      ? Math.round(
          ((enrollmentsThisMonth - enrollmentsLastMonth) /
            enrollmentsLastMonth) *
            1000,
        ) / 10
      : enrollmentsThisMonth > 0
        ? 100
        : 0;

  const averageCourseRating =
    ratingAggregate._count.id > 0 && ratingAggregate._avg.rating != null
      ? Math.round(ratingAggregate._avg.rating * 10) / 10
      : null;

  const studentSatisfaction =
    averageCourseRating != null
      ? Math.round((averageCourseRating / 5) * 100)
      : null;

  return {
    averageCourseRating,
    completionRate,
    studentSatisfaction,
    monthlyGrowth,
  };
}

// ---------------------------------------------------------------------------
// submitCourseRating
// Unchanged — no lesson relation involved.
// ---------------------------------------------------------------------------

export interface SubmitCourseRatingResult {
  success: boolean;
  error?: string;
}

export async function submitCourseRating(
  userId: string,
  courseId: string,
  rating: number,
): Promise<SubmitCourseRatingResult> {
  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return {
      success: false,
      error: "Rating must be an integer between 1 and 5",
    };
  }

  const enrolled = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (!enrolled) {
    return {
      success: false,
      error: "You must be enrolled in this course to rate it",
    };
  }

  await prisma.courseRating.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId, rating },
    update: { rating },
  });

  return { success: true };
}

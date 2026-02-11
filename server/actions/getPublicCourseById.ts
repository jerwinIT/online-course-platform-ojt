"use server";

import prisma from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PublicLesson = {
  id: string;
  title: string;
  duration: number; // in minutes
  order: number;
  // videoUrl intentionally omitted — only expose after enrollment
};

export type PublicSection = {
  id: string;
  title: string;
  order: number;
  lessons: PublicLesson[];
};

export type PublicCourseDetail = {
  id: string;
  title: string;
  subtitle: string | null;
  image: string | null;
  description: string;
  duration: number; // total hours set by admin
  category: {
    id: string;
    name: string;
    slug: string;
  };
  instructor: {
    name: string | null;
    image: string | null;
  };
  sections: PublicSection[];
  totalLessons: number;
  totalEnrollments: number;
  isPublished: boolean;
};

export type GetPublicCourseByIdResult =
  | { success: true; data: PublicCourseDetail }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// getPublicCourseById
// Public-facing — no auth check, only returns published courses.
// Intentionally omits: createdById, lesson content, videoUrls (gated behind enrollment).
// ---------------------------------------------------------------------------

export async function getPublicCourseById(
  courseId: string,
): Promise<GetPublicCourseByIdResult> {
  if (!courseId) {
    return { success: false, error: "Course ID is required." };
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        subtitle: true,
        image: true,
        description: true,
        duration: true,
        isPublished: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            image: true,
          },
        },
        sections: {
          select: {
            id: true,
            title: true,
            order: true,
            lessons: {
              select: {
                id: true,
                title: true,
                duration: true,
                order: true,
                // content and videoUrl intentionally excluded
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      return { success: false, error: "Course not found." };
    }

    if (!course.isPublished) {
      return { success: false, error: "Course not found." };
    }

    const totalLessons = course.sections.reduce(
      (acc, section) => acc + section.lessons.length,
      0,
    );

    return {
      success: true,
      data: {
        id: course.id,
        title: course.title,
        subtitle: course.subtitle,
        image: course.image,
        description: course.description,
        duration: course.duration,
        isPublished: course.isPublished,
        category: course.category,
        instructor: course.createdBy,
        sections: course.sections,
        totalLessons,
        totalEnrollments: course._count.enrollments,
      },
    };
  } catch (error) {
    console.error("[getPublicCourseById] DB error:", error);
    return { success: false, error: "Failed to load course." };
  }
}

"use server";

import { getSession } from "@/server/actions/getSession";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Toggle save/unsave a course for the current user
 */
export async function toggleSaveCourse(courseId: string) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in to save courses",
      };
    }

    const userId = session.user.id;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return {
        success: false,
        error: "Course not found",
      };
    }

    // Check if already saved
    const existingSave = await prisma.savedCourse.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingSave) {
      // Unsave the course
      await prisma.savedCourse.delete({
        where: {
          id: existingSave.id,
        },
      });

      revalidatePath(`/courses/${courseId}`);
      revalidatePath("/courses");
      revalidatePath("/saved-courses");

      return {
        success: true,
        isSaved: false,
        message: "Course removed from saved",
      };
    } else {
      // Save the course
      await prisma.savedCourse.create({
        data: {
          userId,
          courseId,
        },
      });

      revalidatePath(`/courses/${courseId}`);
      revalidatePath("/courses");
      revalidatePath("/saved-courses");

      return {
        success: true,
        isSaved: true,
        message: "Course saved successfully",
      };
    }
  } catch (error) {
    console.error("Error toggling save course:", error);
    return {
      success: false,
      error: "Failed to save/unsave course",
    };
  }
}

/**
 * Check if a course is saved by the current user
 */
export async function isCourseSaved(courseId: string) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return {
        success: true,
        isSaved: false,
      };
    }

    // Use User relation to avoid depending on prisma.savedCourse delegate
    // (can be undefined if client was cached before SavedCourse was added)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        savedCourses: {
          where: { courseId },
          take: 1,
          select: { id: true },
        },
      },
    });

    const isSaved = (user?.savedCourses?.length ?? 0) > 0;

    return {
      success: true,
      isSaved,
    };
  } catch (error) {
    console.error("Error checking saved course:", error);
    return {
      success: false,
      error: "Failed to check saved status",
      isSaved: false,
    };
  }
}

/**
 * Get all saved courses for the current user
 */
export async function getSavedCourses() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in to view saved courses",
      };
    }

    const savedCourses = await prisma.savedCourse.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        course: {
          include: {
            category: true,
            createdBy: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                enrollments: true,
              },
            },
          },
        },
      },
      orderBy: {
        savedAt: "desc",
      },
    });

    const courses = savedCourses.map((sc) => ({
      ...sc.course,
      savedAt: sc.savedAt,
    }));

    return {
      success: true,
      data: courses,
    };
  } catch (error) {
    console.error("Error fetching saved courses:", error);
    return {
      success: false,
      error: "Failed to fetch saved courses",
    };
  }
}

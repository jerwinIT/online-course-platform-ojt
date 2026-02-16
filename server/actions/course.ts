"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/server/actions/getSession";

// ---------------------------------------------------------------------------
// Shared formatting helpers
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const LessonSchema = z.object({
  title: z.string().min(1, "Lesson title is required"),
  content: z.string().default(""),
  videoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  duration: z.coerce.number().int().min(0).default(0),
  order: z.number().int(),
});

const SectionSchema = z.object({
  title: z.string().min(1, "Section title is required"),
  order: z.number().int(),
  lessons: z.array(LessonSchema).default([]),
});

const CourseSchema = z.object({
  title: z.string().min(1, "Course title is required"),
  subtitle: z.string().optional(),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().min(1, "Course description is required"),
  duration: z.coerce
    .number()
    .int()
    .min(0, "Duration must be a non-negative number"),
  categoryId: z.string().uuid("Invalid category"),
  sections: z.array(SectionSchema).default([]),
});

const CategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name too long"),
  slug: z
    .string()
    .min(1, "Category slug is required")
    .max(50, "Category slug too long")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CourseFormData = z.infer<typeof CourseSchema>;

export type ActionResult =
  | { success: true; courseId: string }
  | { success: false; errors: Record<string, string[]> };

export type CategoryActionResult =
  | { success: true; category: { id: string; name: string; slug: string } }
  | { success: false; errors: Record<string, string[]> };

// Note: Image is now handled as a direct URL input in the form
// No file upload function needed

// ---------------------------------------------------------------------------
// createCategory – creates a new category
// ---------------------------------------------------------------------------

export async function createCategory(
  name: string,
  slug: string,
): Promise<CategoryActionResult> {
  // 2. Validate
  const parsed = CategorySchema.safeParse({ name, slug });
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // 3. Check if slug already exists
  try {
    const existingCategory = await prisma.category.findUnique({
      where: { slug: parsed.data.slug },
    });

    if (existingCategory) {
      return {
        success: false,
        errors: { slug: ["A category with this slug already exists."] },
      };
    }

    // 4. Create the category
    const category = await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    revalidatePath("/admin/courses/create");
    return { success: true, category };
  } catch (error) {
    console.error("[createCategory] DB error:", error);
    return {
      success: false,
      errors: {
        _form: [
          "Something went wrong creating the category. Please try again.",
        ],
      },
    };
  }
}

// ---------------------------------------------------------------------------
// getCategories – fetches all categories
// ---------------------------------------------------------------------------

export type GetCategoriesResult =
  | { success: true; data: { id: string; name: string; slug: string }[] }
  | { success: false; error: string };

export async function getCategories(): Promise<GetCategoriesResult> {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, data: categories };
  } catch (error) {
    console.error("[getCategories] DB error:", error);
    return { success: false, error: "Failed to load categories." };
  }
}

// ---------------------------------------------------------------------------
// deleteCategory – removes a category by id (only if no courses reference it)
// ---------------------------------------------------------------------------

export type DeleteCategoryResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteCategory(
  categoryId: string,
): Promise<DeleteCategoryResult> {
  if (!categoryId) {
    return { success: false, error: "Category ID is required." };
  }

  try {
    // Guard: refuse if any course still references this category
    const courseCount = await prisma.course.count({
      where: { categoryId },
    });

    if (courseCount > 0) {
      return {
        success: false,
        error: `Cannot delete: ${courseCount} course${courseCount === 1 ? "" : "s"} still use this category.`,
      };
    }

    await prisma.category.delete({ where: { id: categoryId } });

    revalidatePath("/admin/courses/create");
    return { success: true };
  } catch (error) {
    console.error("[deleteCategory] DB error:", error);
    return {
      success: false,
      error: "Something went wrong deleting the category. Please try again.",
    };
  }
}

// ---------------------------------------------------------------------------
// createCourse – persists everything in one transaction
// ---------------------------------------------------------------------------

export async function createCourse(
  formData: CourseFormData,
): Promise<ActionResult> {
  // 1. Auth check
  const session = await getSession();
  if (!session?.user?.id) {
    return {
      success: false,
      errors: { _form: ["You must be signed in to create a course."] },
    };
  }

  // 2. Validate
  const parsed = CourseSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const {
    title,
    subtitle,
    image,
    description,
    duration,
    categoryId,
    sections,
  } = parsed.data;

  // 3. Persist inside a transaction so partial writes never happen
  try {
    const course = await prisma.$transaction(async (tx) => {
      const newCourse = await tx.course.create({
        data: {
          title,
          subtitle: subtitle ?? null,
          image: image ?? null,
          description,
          duration,
          isPublished: false, // always starts as draft
          categoryId,
          createdById: session.user.id,
          sections: {
            create: sections.map((section, sIdx) => ({
              title: section.title,
              order: sIdx,
              lessons: {
                create: section.lessons.map((lesson, lIdx) => ({
                  title: lesson.title,
                  content: lesson.content,
                  videoUrl: lesson.videoUrl || null,
                  duration: lesson.duration,
                  order: lIdx,
                })),
              },
            })),
          },
        },
        select: { id: true },
      });

      return newCourse;
    });

    revalidatePath("/admin/courses");
    return { success: true, courseId: course.id };
  } catch (error) {
    console.error("[createCourse] DB error:", error);
    return {
      success: false,
      errors: {
        _form: ["Something went wrong saving the course. Please try again."],
      },
    };
  }
}

// ---------------------------------------------------------------------------
// publishCourse – flips isPublished to true
// ---------------------------------------------------------------------------

export async function publishCourse(courseId: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session?.user?.id) {
    return {
      success: false,
      errors: { _form: ["Unauthorized."] },
    };
  }

  try {
    // Ensure the admin owns the course before publishing
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { createdById: true },
    });

    if (!course || course.createdById !== session.user.id) {
      return {
        success: false,
        errors: { _form: ["Course not found or access denied."] },
      };
    }

    await prisma.course.update({
      where: { id: courseId },
      data: { isPublished: true },
    });

    revalidatePath("/admin/courses");
    revalidatePath(`/courses/${courseId}`);
    return { success: true, courseId };
  } catch (error) {
    console.error("[publishCourse] DB error:", error);
    return {
      success: false,
      errors: { _form: ["Failed to publish course."] },
    };
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CourseListItem = {
  id: string;
  title: string;
  subtitle: string | null;
  image: string | null;
  description: string | null;
  duration: number | null;
  isPublished: boolean;
  createdAt: string;
  totalLessons: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  createdBy: {
    name: string | null;
    image: string | null;
  };
  _count: {
    sections: number;
    enrollments: number;
  };
};

export type GetCoursesResult =
  | { success: true; data: CourseListItem[] }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// getCourses – fetches all published courses for the listing page
// ---------------------------------------------------------------------------

export async function getCourses(): Promise<GetCoursesResult> {
  try {
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        subtitle: true,
        image: true,
        description: true,
        duration: true,
        isPublished: true,
        createdAt: true,
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
        _count: {
          select: {
            sections: true,
            enrollments: true,
          },
        },
        sections: {
          select: {
            _count: {
              select: { lessons: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: courses.map(({ sections, ...course }) => ({
        ...course,
        createdAt: course.createdAt.toISOString(),
        totalLessons: sections.reduce((sum, s) => sum + s._count.lessons, 0),
      })),
    };
  } catch (error) {
    console.error("[getCourses] DB error:", error);
    return { success: false, error: "Failed to load courses." };
  }
}

// ---------------------------------------------------------------------------
// getCourseById – fetches a single course with all details for editing
// ---------------------------------------------------------------------------

export type CourseDetailItem = {
  id: string;
  title: string;
  subtitle: string | null;
  image: string | null;
  description: string;
  duration: number;
  isPublished: boolean;
  categoryId: string;
  createdById: string;
  sections: {
    id: string;
    title: string;
    order: number;
    lessons: {
      id: string;
      title: string;
      content: string;
      videoUrl: string | null;
      duration: number;
      order: number;
    }[];
  }[];
};

export type GetCourseByIdResult =
  | { success: true; data: CourseDetailItem }
  | { success: false; error: string };

export async function getCourseById(
  courseId: string,
): Promise<GetCourseByIdResult> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

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
        categoryId: true,
        createdById: true,
        sections: {
          select: {
            id: true,
            title: true,
            order: true,
            lessons: {
              select: {
                id: true,
                title: true,
                content: true,
                videoUrl: true,
                duration: true,
                order: true,
              },
              orderBy: {
                order: "asc",
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!course) {
      return { success: false, error: "Course not found." };
    }

    // Ensure the user owns this course
    if (course.createdById !== session.user.id) {
      return { success: false, error: "Access denied." };
    }

    return { success: true, data: course };
  } catch (error) {
    console.error("[getCourseById] DB error:", error);
    return { success: false, error: "Failed to load course." };
  }
}

// ---------------------------------------------------------------------------
// updateCourse – updates a course with all its sections and lessons
// ---------------------------------------------------------------------------

export async function updateCourse(
  courseId: string,
  formData: CourseFormData,
): Promise<ActionResult> {
  // 1. Auth check
  const session = await getSession();
  if (!session?.user?.id) {
    return {
      success: false,
      errors: { _form: ["You must be signed in to update a course."] },
    };
  }

  if (!courseId) {
    return {
      success: false,
      errors: { _form: ["Course ID is required."] },
    };
  }

  // 2. Validate
  const parsed = CourseSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const {
    title,
    subtitle,
    image,
    description,
    duration,
    categoryId,
    sections,
  } = parsed.data;

  try {
    // First, verify ownership
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
      select: { createdById: true },
    });

    if (!existingCourse) {
      return {
        success: false,
        errors: { _form: ["Course not found."] },
      };
    }

    if (existingCourse.createdById !== session.user.id) {
      return {
        success: false,
        errors: { _form: ["Access denied."] },
      };
    }

    // 3. Update inside a transaction
    await prisma.$transaction(async (tx) => {
      // Update course basic info
      await tx.course.update({
        where: { id: courseId },
        data: {
          title,
          subtitle: subtitle ?? null,
          image: image ?? null,
          description,
          duration,
          categoryId,
        },
      });

      // Delete all existing sections and lessons (cascade should handle lessons)
      await tx.section.deleteMany({
        where: { courseId },
      });

      // Recreate sections and lessons
      if (sections.length > 0) {
        await tx.section.createMany({
          data: sections.map((section, sIdx) => ({
            title: section.title,
            order: sIdx,
            courseId,
          })),
        });

        // Get the newly created sections to get their IDs
        const createdSections = await tx.section.findMany({
          where: { courseId },
          orderBy: { order: "asc" },
          select: { id: true, order: true },
        });

        // Create lessons for each section
        for (let i = 0; i < sections.length; i++) {
          const section = sections[i];
          const sectionRecord = createdSections.find((s) => s.order === i);

          if (sectionRecord && section.lessons.length > 0) {
            await tx.lesson.createMany({
              data: section.lessons.map((lesson, lIdx) => ({
                title: lesson.title,
                content: lesson.content,
                videoUrl: lesson.videoUrl || null,
                duration: lesson.duration,
                order: lIdx,
                sectionId: sectionRecord.id,
              })),
            });
          }
        }
      }
    });

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${courseId}/edit`);
    revalidatePath(`/courses/${courseId}`);
    return { success: true, courseId };
  } catch (error) {
    console.error("[updateCourse] DB error:", error);
    return {
      success: false,
      errors: {
        _form: ["Something went wrong updating the course. Please try again."],
      },
    };
  }
}

// ---------------------------------------------------------------------------
// deleteCourse – removes a course and all its related data
// ---------------------------------------------------------------------------

export type DeleteCourseResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteCourse(
  courseId: string,
  force: boolean = false,
): Promise<DeleteCourseResult> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  if (!courseId) {
    return { success: false, error: "Course ID is required." };
  }

  try {
    // Verify ownership before deletion
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        createdById: true,
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

    if (course.createdById !== session.user.id) {
      return { success: false, error: "Access denied." };
    }

    // Warn about enrollments but allow deletion if force is true
    if (course._count.enrollments > 0 && !force) {
      return {
        success: false,
        error: `Cannot delete: ${course._count.enrollments} student${course._count.enrollments === 1 ? " is" : "s are"} enrolled in this course.`,
      };
    }

    // Delete the course (cascade should handle sections and lessons)
    await prisma.course.delete({
      where: { id: courseId },
    });

    revalidatePath("/admin?tab=courses");
    return { success: true };
  } catch (error) {
    console.error("[deleteCourse] DB error:", error);
    return {
      success: false,
      error: "Something went wrong deleting the course. Please try again.",
    };
  }
}
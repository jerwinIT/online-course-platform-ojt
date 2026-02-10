"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/server/actions/getSession";

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
  image: z.string().optional(),
  description: z.string().min(1, "Course description is required"),
  duration: z.coerce.number().int().min(1, "Duration must be at least 1 hour"),
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

// ---------------------------------------------------------------------------
// Helper: upload image from FormData
// Replace this stub with your actual file storage (S3, Cloudinary, etc.)
// ---------------------------------------------------------------------------

async function handleImageUpload(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;

  // TODO: integrate your storage provider here.
  // Example with a local /public/uploads folder (dev only):
  //
  // const bytes = await file.arrayBuffer();
  // const buffer = Buffer.from(bytes);
  // const filename = `${Date.now()}-${file.name}`;
  // await writeFile(`./public/uploads/${filename}`, buffer);
  // return `/uploads/${filename}`;

  throw new Error(
    "handleImageUpload: no storage provider configured. " +
      "Connect an S3 bucket, Cloudinary, or similar and implement this function.",
  );
}

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
// uploadCourseImage – handles the file upload separately from the main form
// so the heavy multipart request is isolated from the JSON form submission
// ---------------------------------------------------------------------------

export async function uploadCourseImage(
  formData: FormData,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  const file = formData.get("image") as File | null;
  if (!file) {
    return { success: false, error: "No file provided." };
  }

  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
  if (file.size > MAX_SIZE) {
    return { success: false, error: "File exceeds 10 MB limit." };
  }

  const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      success: false,
      error: "Only PNG, JPG, GIF and WEBP are allowed.",
    };
  }

  try {
    const url = await handleImageUpload(file);
    if (!url) return { success: false, error: "Upload returned no URL." };
    return { success: true, url };
  } catch (error) {
    console.error("[uploadCourseImage] error:", error);
    return { success: false, error: "Image upload failed." };
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: courses.map((course) => ({
        ...course,
        createdAt: course.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("[getCourses] DB error:", error);
    return { success: false, error: "Failed to load courses." };
  }
}

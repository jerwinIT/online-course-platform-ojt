"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession } from "@/server/actions/getSession";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DeleteUserResult =
  | { success: true }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// deleteUser – removes a user and all their related data
// ---------------------------------------------------------------------------

export async function deleteUser(userId: string): Promise<DeleteUserResult> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  // Check if the current user is an admin
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (currentUser?.role !== "ADMIN") {
    return {
      success: false,
      error: "Access denied. Admin privileges required.",
    };
  }

  if (!userId) {
    return { success: false, error: "User ID is required." };
  }

  // Prevent self-deletion
  if (userId === session.user.id) {
    return {
      success: false,
      error: "You cannot delete your own account.",
    };
  }

  try {
    // Check if user exists and get their enrollment count
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            enrollments: true,
            courses: true,
          },
        },
      },
    });

    if (!user) {
      return { success: false, error: "User not found." };
    }

    // Optional: prevent deletion if user has created courses
    if (user._count.courses > 0) {
      return {
        success: false,
        error: `Cannot delete: User has created ${user._count.courses} course${user._count.courses === 1 ? "" : "s"}. Please reassign or delete their courses first.`,
      };
    }

    // Manually delete related records since schema lacks cascade deletes
    // Delete in order to respect foreign key constraints
    await prisma.$transaction([
      // Delete user's progress records
      prisma.progress.deleteMany({
        where: { userId },
      }),
      // Delete user's course ratings
      prisma.courseRating.deleteMany({
        where: { userId },
      }),
      // Delete user's enrollments
      prisma.enrollment.deleteMany({
        where: { userId },
      }),
      // Delete user's saved courses (has cascade in schema, but deleting explicitly for safety)
      prisma.savedCourse.deleteMany({
        where: { userId },
      }),
      // Delete user's sessions
      prisma.session.deleteMany({
        where: { userId },
      }),
      // Delete user's accounts (OAuth)
      prisma.account.deleteMany({
        where: { userId },
      }),
      // Finally, delete the user
      prisma.user.delete({
        where: { id: userId },
      }),
    ]);

    revalidatePath("/admin?tab=users");
    return { success: true };
  } catch (error) {
    console.error("[deleteUser] DB error:", error);
    return {
      success: false,
      error: "Something went wrong deleting the user. Please try again.",
    };
  }
}

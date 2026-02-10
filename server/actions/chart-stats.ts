"use server";

import prisma from '@/lib/prisma'

export interface NewUsersLast30Days {
    date: string;
    count: number;
}

export async function getNewUsersLast30Days() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 29);
  
    const users = await prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    })
  
    // Group by date (YYYY-MM-DD)
    const map = new Map<string, number>();
  
    users.forEach((user) => {
      const date = user.createdAt.toISOString().split("T")[0];
      map.set(date, (map.get(date) ?? 0) + 1);
    });
  
    // Fill missing days with 0
    const data = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(thirtyDaysAgo.getDate() + i);
  
      const key = date.toISOString().split("T")[0];
      data.push({
        date: key,
        count: map.get(key) ?? 0,
      });
    }
  
    return data;
  }


  export interface EnrollmentTrendsLast30Days {
    date: string;
    count: number;
  }

  export async function getEnrollmentTrendsLast30Days(): Promise<EnrollmentTrendsLast30Days[]> {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 29);
  
    const enrollments = await prisma.enrollment.findMany({
      where: {
        enrolledAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        enrolledAt: true,
      },
    });
  
    const map = new Map<string, number>();
  
    enrollments.forEach((enrollment) => {
      const date = enrollment.enrolledAt.toISOString().split("T")[0];
      map.set(date, (map.get(date) ?? 0) + 1);
    });
  
    const data: EnrollmentTrendsLast30Days[] = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(thirtyDaysAgo.getDate() + i);
  
      const key = date.toISOString().split("T")[0];
        data.push({
        date: key as string,
        count: map.get(key) ?? 0,
      });
    }
    return data;
  }
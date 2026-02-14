"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  User,
} from "lucide-react";
import Footer from "@/components/footer";
import type { DashboardData } from "@/server/actions/dashboard";
import { formatDuration } from "@/lib/utils/format";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(date: Date | null): string {
  if (!date) return "Unknown date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface DashboardContentProps {
  data: DashboardData;
}

export default function DashboardContent({ data }: DashboardContentProps) {
  const { stats, enrolledCourses, certificates, user } = data;
  const displayName = user.name ?? user.email ?? "there";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Dashboard Header */}
      <section className="bg-secondary border-b border-border py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                  Welcome, {displayName}
                </h1>
                <p className="text-lg text-muted-foreground">
                  Here&apos;s your learning overview
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Courses Enrolled
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.coursesEnrolled}
                    </p>
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Learning Time
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {formatDuration(stats.learningMinutes)}
                    </p>
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Completed Lessons
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.completedLessons}
                    </p>
                  </div>
                  <div className="w-12 h-12  flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Avg. Progress
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.avgProgress}%
                    </p>
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="courses" className="space-y-6">
            <TabsList>
              <TabsTrigger value="courses">My Courses</TabsTrigger>
              <TabsTrigger value="certificates">
                Certificates
                {certificates.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    {certificates.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* My Courses Tab */}
            <TabsContent value="courses" className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  Currently Learning
                </h2>
                <Link href="/courses">
                  <Button variant="outline">Browse More</Button>
                </Link>
              </div>

              {enrolledCourses.length === 0 ? (
                <Card className="border-2 border-dashed">
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <BookOpen className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                      <p className="text-lg font-medium text-foreground mb-1">
                        No courses yet
                      </p>
                      <p className="text-muted-foreground mb-6">
                        Start your learning journey by enrolling in a course.
                      </p>
                      <Link href="/courses">
                        <Button>Browse Courses</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {enrolledCourses.map((course) => (
                    <Card
                      key={course.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                          {/* Course thumbnail */}
                          <div className="hidden md:flex items-center justify-center">
                            {course.image ? (
                              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                                <Image
                                  src={course.image}
                                  alt={course.title}
                                  fill
                                  className="object-cover"
                                  sizes="160px"
                                />
                              </div>
                            ) : (
                              <div className="w-full aspect-video rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                                <BookOpen className="w-8 h-8 text-primary opacity-40" />
                              </div>
                            )}
                          </div>

                          {/* Course info */}
                          <div className="md:col-span-2">
                            <Link
                              href={`/courses/${course.id}`}
                              className="group"
                            >
                              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition mb-1">
                                {course.title}
                              </h3>
                            </Link>
                            {course.instructorName && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {course.instructorName}
                              </p>
                            )}
                            {course.subtitle && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {course.subtitle}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Enrolled {formatDate(course.enrolledAt)}
                            </p>
                          </div>

                          {/* Progress */}
                          <div>
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium text-foreground">
                                    {course.progress}% Complete
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {course.completedLessons} /{" "}
                                    {course.totalLessons} lessons
                                  </span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                                  <div
                                    className="bg-primary h-full rounded-full transition-all"
                                    style={{ width: `${course.progress}%` }}
                                  />
                                </div>
                              </div>
                              <Link href={`/courses/${course.id}`}>
                                <Button size="sm" className="w-full">
                                  {course.progress === 0
                                    ? "Start Learning"
                                    : course.progress === 100
                                      ? "Review Course"
                                      : "Continue Learning"}
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Certificates Tab */}
            <TabsContent value="certificates" className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Your Certificates
              </h2>

              {certificates.length > 0 ? (
                <div className="space-y-4">
                  {certificates.map((cert) => (
                    <Card
                      key={cert.courseId}
                      className="border-2 border-dashed"
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                              <FileText className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {cert.courseTitle}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Completed on {formatDate(cert.completedAt)}
                              </p>
                            </div>
                          </div>
                          <Button>Download</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : null}

              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                <p className="text-muted-foreground">
                  {certificates.length === 0
                    ? "Complete a course to earn your first certificate!"
                    : "Keep going — more certificates await!"}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}

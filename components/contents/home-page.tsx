import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CourseListItem } from "@/server/actions/course";
import { BookOpen, Users, ArrowRight, Clock, Globe } from "lucide-react";
import Footer from "../footer";
import { formatDuration } from "@/lib/utils/format";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface HomePageProps {
  courses: CourseListItem[];
  categories: Category[];
}

export default function HomePage({ courses, categories }: HomePageProps) {
  const previewCourses = (courses ?? []).slice(0, 4);

  return (
    <div className="min-h-screen bg-secondary">
      {/* ── Hero ── */}
      <section className="relative px-4 pt-16 pb-20 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Warm accent blob */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-secondary" />

        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-2xl space-y-6">
            <Badge>Your School&apos;s Learning Hub</Badge>

            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
              Explore. <span className="relative z-10">Learn.</span>
              Grow.
            </h1>

            <p className="text-lg leading-relaxed max-w-xl">
              A private space built exclusively for our students — discover
              supplementary lessons, tutorials, and resources across
              programming, business, design, and more.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/courses">
                <Button size="lg">
                  Browse All Courses
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Floating stat cards */}
          <div className="mt-14 flex flex-wrap gap-4">
            {[
              { value: "100%", label: "Free for students" },
              { value: "Self-paced", label: "Learn on your schedule" },
              { value: "Multi-topic", label: "Curated by educators" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-3 shadow-sm"
              >
                <div>
                  <p className="text-base font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Cards ── */}
      <section className="border-y border-gray-200 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Browse by Category
              </h2>
              <p className="text-muted-foreground text-lg">
                Explore topics curated by your educators
              </p>
            </div>
            {categories.length > 6 && (
              <Link
                href="/courses"
                className="text-sm font-medium text-primary hover:underline whitespace-nowrap"
              >
                View all →
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {categories.slice(0, 6).map(({ name, slug }) => (
              <Link
                key={slug}
                href={`/courses?category=${slug}`}
                className="h-full"
              >
                <div className="group flex h-full items-center justify-center rounded-lg border border-gray-200 bg-primary/5 px-4 py-6 text-center hover:border-primary/40 hover:bg-primary transition-all duration-200">
                  <span className="text-sm sm:text-base font-semibold text-primary group-hover:text-white transition-colors">
                    {name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Courses Preview */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Recently
            </h2>
            <p className="text-muted-foreground text-lg">
              Start learning from our available courses
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Courses Grid */}
            <div className="lg:col-span-3">
              {previewCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {previewCourses.map((course) => (
                    <Card
                      key={course.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
                    >
                      {/* Course Image */}
                      <div className="bg-gradient-to-br from-primary/10 to-accent/10 h-40 flex items-center justify-center relative overflow-hidden">
                        {course.image ? (
                          <Image
                            src={course.image}
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <BookOpen className="w-12 h-12 text-primary opacity-40" />
                        )}
                      </div>

                      <CardHeader>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <CardTitle className="line-clamp-2 flex-1">
                            {course.title}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className="whitespace-nowrap"
                          >
                            {course.category.name}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-1">
                          {course.subtitle || course.createdBy.name || "Course"}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          {course.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {course.description}
                            </p>
                          )}

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users className="w-4 h-4" />
                              <span>{course._count.enrollments} enrolled</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{formatDuration(course.duration)}</span>
                            </div>
                          </div>
                        </div>

                        <Link href={`/courses/${course.id}`} className="w-full">
                          <Button className="w-full">View Course</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto text-muted-foreground opacity-30 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No courses found
                  </h3>
                  <p className="text-muted-foreground">
                    No courses available yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why LearnHub ── */}
      <section className="border-y border-gray-200 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              Made for Students
            </h2>
            <p className="text-muted-foreground text-lg">
              LearnHub is a private platform — only students enrolled in school
              can access these materials.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: "Curated by Educators",
                desc: "Every course is reviewed and uploaded by your own teachers and department heads.",
              },
              {
                icon: Users,
                title: "For Your Batch",
                desc: "Content is tailored to your school's curriculum and extracurricular programs.",
              },
              {
                icon: Globe,
                title: "Any Device, Anytime",
                desc: "Watch lessons, revisit materials, and learn at your own pace — from anywhere.",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex gap-4">
                  <div className="mt-1 flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-white/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="border-y border-gray-200 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              Ready to start learning?
            </h2>
            <p className="text-muted-foreground text-lg">
              Explore all available courses and start expanding your skills
              today.
            </p>
          </div>
          <Link href="/courses">
            <Button
              size="lg"
              className="gap-2 bg-gray-900 hover:bg-gray-700 text-white rounded-xl px-8 shadow-md whitespace-nowrap"
            >
              Go to Courses <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
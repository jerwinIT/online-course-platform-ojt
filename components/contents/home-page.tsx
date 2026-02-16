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
      <section className="relative pb-28 sm:pt-24 sm:pb-32 lg:pt-32 lg:pb-40 overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
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

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl space-y-8 lg:space-y-10">
            <Badge className="text-sm">Your School&apos;s Learning Hub</Badge>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
              Explore. <span className="relative z-10">Learn.</span>
              <br />
              Grow.
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed max-w-2xl text-gray-700">
              A private space built exclusively for our students — discover
              supplementary lessons, tutorials, and resources across
              programming, business, design, and more.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/courses">
                <Button size="lg" className="text-base px-8 py-6">
                  Browse All Courses
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Floating stat cards */}
          <div className="mt-16 lg:mt-20 flex flex-wrap gap-4 lg:gap-6">
            {[
              { value: "100%", label: "Free for students" },
              { value: "Self-paced", label: "Learn on your schedule" },
              { value: "Multi-topic", label: "Curated by educators" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-4 lg:px-8 lg:py-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="text-lg lg:text-xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm lg:text-base text-gray-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Cards ── */}
      <section className="border-y border-gray-200 bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Browse by Category
              </h2>
              <p className="text-muted-foreground text-lg lg:text-xl">
                Explore topics curated by your educators
              </p>
            </div>
            {categories.length > 6 && (
              <Link
                href="/courses"
                className="text-sm lg:text-base font-medium text-primary hover:underline whitespace-nowrap"
              >
                View all →
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-6">
            {categories.slice(0, 6).map(({ name, slug }) => (
              <Link
                key={slug}
                href={`/courses?category=${slug}`}
                className="h-full"
              >
                <div className="group flex h-full items-center justify-center rounded-lg border border-gray-200 bg-primary/5 px-4 py-8 lg:py-10 text-center hover:border-primary/40 hover:bg-primary transition-all duration-200">
                  <span className="text-sm sm:text-base lg:text-lg font-semibold text-primary group-hover:text-white transition-colors">
                    {name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Courses Preview */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Recently
            </h2>
            <p className="text-muted-foreground text-lg lg:text-xl">
              Start learning from our available courses
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Courses Grid */}
            <div className="lg:col-span-3">
              {previewCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {previewCourses.map((course) => (
                    <Card
                      key={course.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
                    >
                      {/* Course Image */}
                      <div className="bg-gradient-to-br from-primary/10 to-accent/10 h-48 flex items-center justify-center relative overflow-hidden">
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
      <section className="border-y border-gray-200 bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
              Made for Students
            </h2>
            <p className="text-muted-foreground text-lg lg:text-xl">
              LearnHub is a private platform — only students enrolled in school
              can access these materials.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
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
                  <div className="mt-1 flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg lg:text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-base leading-relaxed">
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
      <section className="border-y border-gray-200 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-8 lg:gap-12">
          <div className="flex-1">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
              Ready to start learning?
            </h2>
            <p className="text-muted-foreground text-lg lg:text-xl">
              Explore all available courses and start expanding your skills
              today.
            </p>
          </div>
          <Link href="/courses">
            <Button
              size="lg"
              className="gap-2 bg-gray-900 hover:bg-gray-700 text-white rounded-xl px-10 py-7 text-base lg:text-lg shadow-md whitespace-nowrap"
            >
              Go to Courses <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
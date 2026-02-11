import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Clock,
  BookOpen,
  Award,
  Share2,
  Heart,
  PlayCircle,
  GraduationCap,
} from "lucide-react";
import Footer from "@/components/footer";
import { getPublicCourseById } from "@/server/actions/getPublicCourseById";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert total minutes → "Xh Ym" or fall back to the admin-set duration in hours */
function formatDuration(hours: number, totalMinutes?: number): string {
  if (totalMinutes && totalMinutes > 0) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`;
  }
  return `${hours} hours`;
}

/** Sum all lesson durations (in minutes) across all sections */
function sumLessonMinutes(
  sections: { lessons: { duration: number }[] }[],
): number {
  return sections.reduce(
    (total, section) =>
      total + section.lessons.reduce((t, l) => t + (l.duration ?? 0), 0),
    0,
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 15: params is now a Promise — must await before accessing .id
  const { id } = await params;
  const result = await getPublicCourseById(id);

  if (!result.success) {
    notFound();
  }

  const course = result.data;
  const totalMinutes = sumLessonMinutes(course.sections);
  const displayDuration = formatDuration(course.duration, totalMinutes);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ------------------------------------------------------------------ */}
      {/* Hero Section                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 border-b border-border px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/courses"
            className="text-primary hover:underline text-sm mb-4 inline-block"
          >
            ← Back to Courses
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: course meta */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-3">
                <Badge className="w-fit">{course.category.name}</Badge>
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground text-balance">
                  {course.title}
                </h1>
                {course.subtitle && (
                  <p className="text-xl text-muted-foreground">
                    {course.subtitle}
                  </p>
                )}
              </div>

              <p className="text-lg text-muted-foreground">
                {course.description}
              </p>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-5 h-5" />
                  <span>
                    {course.totalEnrollments > 0
                      ? course.totalEnrollments >= 1000
                        ? `${(course.totalEnrollments / 1000).toFixed(1)}K students`
                        : `${course.totalEnrollments} students`
                      : "Be the first to enroll!"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-5 h-5" />
                  <span>{displayDuration}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="w-5 h-5" />
                  <span>{course.totalLessons} lessons</span>
                </div>
              </div>

              {/* Instructor pill */}
              <div className="flex items-center gap-3">
                {course.instructor.image ? (
                  <Image
                    src={course.instructor.image}
                    alt={course.instructor.name ?? "Instructor"}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Instructor</p>
                  <p className="text-sm font-medium text-foreground">
                    {course.instructor.name ?? "Unknown Instructor"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: sticky enroll card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                {course.image ? (
                  <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-primary/10 to-accent/10 h-40 flex items-center justify-center rounded-t-lg">
                    <BookOpen className="w-12 h-12 text-primary opacity-40" />
                  </div>
                )}

                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>
                        {course.totalEnrollments > 0
                          ? `${course.totalEnrollments.toLocaleString()} enrolled`
                          : "Be the first to enroll!"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{displayDuration} of content</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <PlayCircle className="w-4 h-4" />
                      <span>{course.totalLessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Award className="w-4 h-4" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>

                  <Button className="w-full" size="lg">
                    Enroll Now
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 bg-transparent"
                    >
                      <Heart className="w-4 h-4" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 bg-transparent"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Content Tabs                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Tabs defaultValue="curriculum" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto">
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            {/* ---- Curriculum Tab ---------------------------------------- */}
            <TabsContent value="curriculum" className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  Course Curriculum
                </h2>
                <p className="text-sm text-muted-foreground">
                  {course.sections.length} sections • {course.totalLessons}{" "}
                  lessons • {displayDuration} total
                </p>
              </div>

              <div className="space-y-3">
                {course.sections.map((section, i) => (
                  <Card key={section.id} className="overflow-hidden">
                    <CardHeader className="pb-3 bg-muted/30">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">
                            <span className="text-muted-foreground mr-2 text-sm">
                              Section {i + 1}
                            </span>
                            {section.title}
                          </CardTitle>
                          <CardDescription>
                            {section.lessons.length} lesson
                            {section.lessons.length !== 1 ? "s" : ""}
                            {section.lessons.length > 0 &&
                              ` • ${formatDuration(
                                0,
                                section.lessons.reduce(
                                  (t, l) => t + (l.duration ?? 0),
                                  0,
                                ),
                              )}`}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    {section.lessons.length > 0 && (
                      <CardContent className="pt-0 divide-y divide-border">
                        {section.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between py-3"
                          >
                            <div className="flex items-center gap-3">
                              <PlayCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm text-foreground">
                                {lesson.title}
                              </span>
                            </div>
                            {lesson.duration > 0 && (
                              <span className="text-xs text-muted-foreground ml-4 flex-shrink-0">
                                {formatDuration(0, lesson.duration)}
                              </span>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* ---- About Tab --------------------------------------------- */}
            <TabsContent value="about" className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  About this course
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {course.description}
                </p>
              </div>

              {/* Instructor card */}
              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Your instructor
                </h3>
                <div className="flex items-start gap-4">
                  {course.instructor.image ? (
                    <Image
                      src={course.instructor.image}
                      alt={course.instructor.name ?? "Instructor"}
                      width={64}
                      height={64}
                      className="rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-8 h-8 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground text-lg">
                      {course.instructor.name ?? "Unknown Instructor"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Course creator
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-lg border border-border p-4 text-center space-y-1">
                  <Users className="w-6 h-6 text-primary mx-auto" />
                  <p className="font-bold text-lg text-foreground">
                    {course.totalEnrollments.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
                <div className="rounded-lg border border-border p-4 text-center space-y-1">
                  <BookOpen className="w-6 h-6 text-primary mx-auto" />
                  <p className="font-bold text-lg text-foreground">
                    {course.totalLessons}
                  </p>
                  <p className="text-xs text-muted-foreground">Lessons</p>
                </div>
                <div className="rounded-lg border border-border p-4 text-center space-y-1">
                  <Clock className="w-6 h-6 text-primary mx-auto" />
                  <p className="font-bold text-lg text-foreground">
                    {displayDuration}
                  </p>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
                <div className="rounded-lg border border-border p-4 text-center space-y-1">
                  <Award className="w-6 h-6 text-primary mx-auto" />
                  <p className="font-bold text-lg text-foreground">Yes</p>
                  <p className="text-xs text-muted-foreground">Certificate</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, BookOpen, Heart } from "lucide-react";
import Footer from "@/components/footer";
import { getSavedCourses } from "@/server/actions/savedCourse";
import { formatDuration } from "@/lib/utils/format";
import { SaveButton } from "@/components/save-button";

export default async function SavedCoursesPage() {
  const result = await getSavedCourses();

  if (!result.success) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <section className="bg-secondary border-b border-border py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl space-y-4 lg:space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#d72323] leading-[1.1]">
                Saved Courses
              </h1>
              <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-gray-700">
                Your bookmarked courses for later
              </p>
            </div>
          </div>
        </section>
        <div className="flex-1 min-h-[calc(100vh-16rem)]">
          <section className="h-full px-4 py-16 sm:py-20 lg:py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl text-center py-12">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-destructive mb-2">
                  Error Loading Saved Courses
                </h3>
                <p className="text-sm text-muted-foreground">{result.error}</p>
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </div>
    );
  }

  const savedCourses = result.data;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <section className="bg-secondary border-b border-border py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl space-y-4 lg:space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#d72323] leading-[1.1]">
              Saved Courses
            </h1>
            <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-gray-700">
              Your bookmarked courses for later
            </p>
          </div>
        </div>
      </section>

      <div className="flex-1 min-h-[calc(100vh-16rem)]">
        <section className="h-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl h-full">
            {savedCourses && savedCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {savedCourses.map((course) => (
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
                        <Badge variant="outline" className="whitespace-nowrap">
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

                      <div className="flex gap-2">
                        <Link href={`/courses/${course.id}`} className="flex-1">
                          <Button className="w-full">View Course</Button>
                        </Link>
                        <SaveButton
                          courseId={course.id}
                          initialIsSaved={true}
                          variant="outline"
                          size="default"
                          showText={false}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 mx-auto text-muted-foreground opacity-30 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No saved courses yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start saving courses you&apos;re interested in for easy access
                  later
                </p>
                <Link href="/courses">
                  <Button>Browse Courses</Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
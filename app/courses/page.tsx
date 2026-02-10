"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Clock, BookOpen, Search, Loader2 } from "lucide-react";
import Footer from "@/components/footer";
import { getCourses, type CourseListItem } from "@/server/actions/course"; // Adjust path as needed

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses on mount
  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      setError(null);

      const result = await getCourses();

      if (result.success) {
        setCourses(result.data);
      } else {
        setError(result.error);
      }

      setLoading(false);
    }

    fetchCourses();
  }, []);

  // Filter courses based on search
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.createdBy.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Helper to format duration (assuming it's in minutes)
  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <section className="bg-secondary border-b border-border px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Explore Courses
          </h1>
          <p className="text-lg text-muted-foreground">
            Find the perfect course to learn new skills and advance your career.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6 sticky top-20">
                {/* Search */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Search</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search courses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Stats */}
                {!loading && !error && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Stats</h3>
                    <div className="text-sm text-muted-foreground">
                      <p>{courses.length} total courses</p>
                      <p>{filteredCourses.length} results</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Courses Grid */}
            <div className="lg:col-span-3">
              <div className="space-y-4">
                {/* Loading State */}
                {loading && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground">Loading courses...</p>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="text-center py-12">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
                      <h3 className="text-lg font-semibold text-destructive mb-2">
                        Error Loading Courses
                      </h3>
                      <p className="text-sm text-muted-foreground">{error}</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => window.location.reload()}
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                )}

                {/* Courses List */}
                {!loading && !error && filteredCourses.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredCourses.map((course) => (
                      <Card
                        key={course.id}
                        className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
                      >
                        {/* Course Image */}
                        <div className="bg-gradient-to-br from-primary/10 to-accent/10 h-40 flex items-center justify-center relative overflow-hidden">
                          {course.image ? (
                            <img
                              src={course.image}
                              alt={course.title}
                              className="w-full h-full object-cover"
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
                              {course._count.sections} sections
                            </Badge>
                          </div>
                          <CardDescription className="line-clamp-1">
                            {course.subtitle ||
                              course.createdBy.name ||
                              "Course"}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-3">
                            {/* Description */}
                            {course.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {course.description}
                              </p>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="w-4 h-4" />
                                <span>
                                  {course._count.enrollments} enrolled
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>{formatDuration(course.duration)}</span>
                              </div>
                            </div>
                          </div>

                          <Link
                            href={`/courses/${course.id}`}
                            className="w-full"
                          >
                            <Button className="w-full">View Course</Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {!loading && !error && filteredCourses.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 mx-auto text-muted-foreground opacity-30 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No courses found
                    </h3>
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? "Try adjusting your search"
                        : "No courses available yet"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

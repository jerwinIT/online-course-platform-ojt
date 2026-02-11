"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Users, Clock, BookOpen, Search } from "lucide-react";
import type { CourseListItem } from "@/server/actions/course";
import { formatDuration } from "@/lib/utils/format";

interface CoursesClientProps {
  courses: CourseListItem[];
}

export default function CoursesClient({ courses }: CoursesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = courses.filter((course) => {
    const q = searchQuery.toLowerCase();
    return (
      course.title.toLowerCase().includes(q) ||
      course.subtitle?.toLowerCase().includes(q) ||
      course.createdBy.name?.toLowerCase().includes(q) ||
      course.category.name.toLowerCase().includes(q)
    );
  });

  return (
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
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Stats</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{courses.length} total courses</p>
                  {searchQuery && <p>{filteredCourses.length} results</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="lg:col-span-3">
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCourses.map((course) => (
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
                  {searchQuery
                    ? "Try adjusting your search"
                    : "No courses available yet"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

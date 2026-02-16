"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
import { getCategories } from "@/server/actions/course";
import { formatDuration } from "@/lib/utils/format";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CoursesClientProps {
  courses: CourseListItem[];
}

export default function CoursesClient({ courses }: CoursesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string; slug: string }>
  >([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Read category from URL, defaulting to "all"
  const categorySlug = searchParams.get("category") ?? "all";

  // Derive the selected categoryId from the slug
  const categoryId =
    categorySlug === "all"
      ? "all"
      : (categories.find((c) => c.slug === categorySlug)?.id ?? "all");

  const updateCategoryParam = useCallback(
    (newCategoryId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newCategoryId === "all") {
        params.delete("category");
      } else {
        const slug = categories.find((c) => c.id === newCategoryId)?.slug;
        if (slug) {
          params.set("category", slug);
        }
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [categories, pathname, router, searchParams],
  );

  // Fetch categories from server action
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const result = await getCategories();
        if (result.success) {
          setCategories(result.data);
        } else {
          console.error("Failed to load categories:", result.error);
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      course.title.toLowerCase().includes(q) ||
      course.subtitle?.toLowerCase().includes(q) ||
      course.createdBy.name?.toLowerCase().includes(q) ||
      course.category.name.toLowerCase().includes(q);

    const matchesCategory =
      categoryId === "all" || course.category.id === categoryId;

    return matchesSearch && matchesCategory;
  });

  return (
    <section className="h-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl h-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-24">
              {/* Search */}
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground text-base lg:text-lg">Search</h3>
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

              {/* Category */}
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground text-base lg:text-lg">Category</h3>
                <Select value={categoryId} onValueChange={updateCategoryParam}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectGroup>
                      <SelectItem value="all">All Categories</SelectItem>
                      {loadingCategories ? (
                        <SelectItem value="loading" disabled>
                          Loading categories...
                        </SelectItem>
                      ) : categories.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          No categories available
                        </SelectItem>
                      ) : (
                        categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="lg:col-span-3">
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
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
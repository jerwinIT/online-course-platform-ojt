"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
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
import {
  Users,
  Clock,
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

export default function CoursesClient({
  courses,
  totalPages,
  currentPage,
  totalCount,
}: CoursesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
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

  // Update URL params helper
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  const updateCategoryParam = useCallback(
    (newCategoryId: string) => {
      const slug =
        newCategoryId === "all"
          ? null
          : categories.find((c) => c.id === newCategoryId)?.slug || null;

      updateParams({
        category: slug,
        page: null, // Reset to page 1 when changing category
      });
    },
    [categories, updateParams],
  );

  // Handle search with debounce
  const handleSearch = useCallback(
    (value: string) => {
      setSearchQuery(value);

      // Debounce search
      const timeoutId = setTimeout(() => {
        updateParams({
          search: value || null,
          page: null, // Reset to page 1 when searching
        });
      }, 500);

      return () => clearTimeout(timeoutId);
    },
    [updateParams],
  );

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages) return;
      updateParams({ page: newPage.toString() });
    },
    [totalPages, updateParams],
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

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <section className="flex-1 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
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
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Category</h3>
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

              {/* Results count */}
              {totalCount > 0 && (
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * 12 + 1}-
                  {Math.min(currentPage * 12, totalCount)} of {totalCount}{" "}
                  courses
                </div>
              )}
            </div>
          </div>

          {/* Courses Grid */}
          <div className="lg:col-span-3">
            {/* Loading overlay */}
            {isPending && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">
                    Loading courses...
                  </p>
                </div>
              </div>
            )}

            <div className={isPending ? "opacity-50" : ""}>
              {courses.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {courses.map((course) => (
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
                            {course.subtitle ||
                              course.createdBy.name ||
                              "Course"}
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

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isPending}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, index) =>
                          page === "..." ? (
                            <span key={`ellipsis-${index}`} className="px-2">
                              ...
                            </span>
                          ) : (
                            <Button
                              key={page}
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => handlePageChange(page as number)}
                              disabled={isPending}
                              className="min-w-[40px]"
                            >
                              {page}
                            </Button>
                          ),
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || isPending}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto text-muted-foreground opacity-30 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No courses found
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "Try adjusting your search or filters"
                      : "No courses available yet"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

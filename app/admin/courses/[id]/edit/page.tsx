"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  getCourseById,
  updateCourse,
  deleteCourse,
  getCategories,
  type CourseFormData,
} from "@/server/actions/course";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import Link from "next/link";
// Type for form sections/lessons matching the schema
type FormLesson = {
  title: string;
  content: string;
  videoUrl: string;
  duration: number;
  order: number;
};

type FormSection = {
  title: string;
  order: number;
  lessons: FormLesson[];
};

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<
    { id: string; name: string; slug: string }[]
  >([]);

  const [formData, setFormData] = useState<{
    title: string;
    subtitle: string;
    image: string;
    description: string;
    categoryId: string;
    sections: FormSection[];
  }>({
    title: "",
    subtitle: "",
    image: "",
    description: "",
    categoryId: "",
    sections: [],
  });

  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  // Fetch categories
  useEffect(() => {
    const loadCategories = async () => {
      const result = await getCategories();
      if (result.success) {
        setCategories(result.data);
      }
    };
    loadCategories();
  }, []);

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const result = await getCourseById(courseId);

        if (!result.success) {
          setError(result.error);
          return;
        }

        const course = result.data;
        setFormData({
          title: course.title,
          subtitle: course.subtitle || "",
          image: course.image || "",
          description: course.description,
          categoryId: course.categoryId,
          sections: course.sections.map((section) => ({
            title: section.title,
            order: section.order,
            lessons: section.lessons.map((lesson) => ({
              title: lesson.title,
              content: lesson.content,
              videoUrl: lesson.videoUrl || "",
              duration: lesson.duration,
              order: lesson.order,
            })),
          })),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setFormErrors({});

      const computedDuration = formData.sections.reduce(
        (total, sec) =>
          total + sec.lessons.reduce((sum, l) => sum + (l.duration || 0), 0),
        0,
      );

      const courseFormData: CourseFormData = {
        title: formData.title,
        subtitle: formData.subtitle,
        image: formData.image,
        description: formData.description,
        duration: computedDuration,
        categoryId: formData.categoryId,
        sections: formData.sections,
      };

      const result = await updateCourse(courseId, courseFormData);

      if (!result.success) {
        setFormErrors(result.errors);
        if (result.errors._form) {
          setError(result.errors._form[0]);
        }
        toast.error("Failed to update course");
        return;
      }

      toast.success("Course updated successfully!");
      router.push("/admin?tab=courses");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update course");
      toast.error("Failed to update course");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);

      const result = await deleteCourse(courseId);

      if (!result.success) {
        setError(result.error);
        toast.error(result.error);
        setSaving(false);
        return;
      }

      toast.success("Course deleted successfully!");
      router.push("/admin?tab=courses");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete course";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // Section management
  const addSection = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          title: "",
          order: prev.sections.length,
          lessons: [],
        },
      ],
    }));
  };

  const removeSection = (sectionIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections
        .filter((_, idx) => idx !== sectionIndex)
        .map((section, idx) => ({ ...section, order: idx })),
    }));
  };

  const updateSection = (sectionIndex: number, title: string) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((section, idx) =>
        idx === sectionIndex ? { ...section, title } : section,
      ),
    }));
  };

  // Lesson management
  const addLesson = (sectionIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((section, idx) =>
        idx === sectionIndex
          ? {
              ...section,
              lessons: [
                ...section.lessons,
                {
                  title: "",
                  content: "",
                  videoUrl: "",
                  duration: 0,
                  order: section.lessons.length,
                },
              ],
            }
          : section,
      ),
    }));
  };

  const removeLesson = (sectionIndex: number, lessonIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((section, sIdx) =>
        sIdx === sectionIndex
          ? {
              ...section,
              lessons: section.lessons
                .filter((_, lIdx) => lIdx !== lessonIndex)
                .map((lesson, idx) => ({ ...lesson, order: idx })),
            }
          : section,
      ),
    }));
  };

  const updateLesson = (
    sectionIndex: number,
    lessonIndex: number,
    field: keyof FormLesson,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((section, sIdx) =>
        sIdx === sectionIndex
          ? {
              ...section,
              lessons: section.lessons.map((lesson, lIdx) =>
                lIdx === lessonIndex ? { ...lesson, [field]: value } : lesson,
              ),
            }
          : section,
      ),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-900 font-medium">{error}</p>
          <Link
            href="/admin?tab=courses"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin?tab=courses"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
          <p className="text-gray-600 mt-2">
            Update your course information, sections, and lessons
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-sm rounded-lg p-6 space-y-8"
        >
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Basic Information
            </h2>

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Course Title *
              </label>
              <Input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., Introduction to Web Development"
              />
              {formErrors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.title[0]}
                </p>
              )}
            </div>

            {/* Subtitle */}
            <div>
              <label
                htmlFor="subtitle"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Subtitle
              </label>
              <Input
                type="text"
                id="subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="A brief tagline for your course"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Describe what students will learn in this course..."
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.description[0]}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="categoryId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.categoryId ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {formErrors.categoryId && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.categoryId[0]}
                </p>
              )}
            </div>

            {/* Image URL */}
            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Course Image URL
              </label>
              <Input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/course-image.jpg"
              />
            </div>
          </div>

          {/* Course Content - Sections & Lessons */}
          <div className="space-y-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Course Content
                </h2>
                {(() => {
                  const totalMinutes = formData.sections.reduce(
                    (total, sec) =>
                      total +
                      sec.lessons.reduce(
                        (sum, l) => sum + (l.duration || 0),
                        0,
                      ),
                    0,
                  );
                  const display =
                    totalMinutes >= 60
                      ? `${Math.floor(totalMinutes / 60)}h${totalMinutes % 60 > 0 ? ` ${totalMinutes % 60}min` : ""}`
                      : `${totalMinutes} min`;
                  return (
                    <p className="text-sm text-gray-500 mt-0.5">
                      Total duration:{" "}
                      <span className="font-medium text-gray-700">
                        {totalMinutes > 0 ? display : "—"}
                      </span>{" "}
                      <span className="text-xs text-gray-400">
                        (computed from lessons, saved on update)
                      </span>
                    </p>
                  );
                })()}
              </div>
              <Button type="button" onClick={addSection}>
                + Add Section
              </Button>
            </div>

            {formData.sections.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-600">
                  No sections yet. Add a section to get started.
                </p>
              </div>
            )}

            {formData.sections.map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                className="border border-gray-200 rounded-lg p-6 space-y-4 bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Section {sectionIndex + 1}
                  </h3>
                  <Button
                    size="icon"
                    variant="ghost"
                    type="button"
                    onClick={() => removeSection(sectionIndex)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section Title *
                  </label>
                  <Input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      updateSection(sectionIndex, e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Getting Started"
                  />
                </div>

                {/* Lessons */}
                <div className="space-y-3 ml-4 pl-4 border-l-2 border-gray-300">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">
                      Lessons
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent"
                      type="button"
                      onClick={() => addLesson(sectionIndex)}
                    >
                      Add Lesson
                    </Button>
                  </div>

                  {section.lessons.length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      No lessons in this section yet.
                    </p>
                  )}

                  {section.lessons.map((lesson, lessonIndex) => (
                    <div
                      key={lessonIndex}
                      className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Lesson {lessonIndex + 1}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          type="button"
                          className="text-destructive"
                          onClick={() =>
                            removeLesson(sectionIndex, lessonIndex)
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Lesson Title *
                        </label>
                        <Input
                          type="text"
                          value={lesson.title}
                          onChange={(e) =>
                            updateLesson(
                              sectionIndex,
                              lessonIndex,
                              "title",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Introduction to Variables"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Content
                        </label>
                        <textarea
                          value={lesson.content}
                          onChange={(e) =>
                            updateLesson(
                              sectionIndex,
                              lessonIndex,
                              "content",
                              e.target.value,
                            )
                          }
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Lesson description or content"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Video URL
                          </label>
                          <Input
                            type="url"
                            value={lesson.videoUrl}
                            onChange={(e) =>
                              updateLesson(
                                sectionIndex,
                                lessonIndex,
                                "videoUrl",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://..."
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Duration (minutes)
                          </label>
                          <Input
                            type="number"
                            value={lesson.duration}
                            onChange={(e) =>
                              updateLesson(
                                sectionIndex,
                                lessonIndex,
                                "duration",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            min="0"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Course</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Course</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete This action cannot be undone
                    and will remove all course content, sections, and lessons.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.push("/admin?tab=courses")}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

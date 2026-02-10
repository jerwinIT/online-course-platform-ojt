"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Save,
  X,
  Loader2,
} from "lucide-react";
import Footer from "@/components/footer";
import {
  createCourse,
  publishCourse,
  uploadCourseImage,
  type CourseFormData,
} from "@/server/actions/course";
import { useRouter } from "next/navigation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Lesson {
  _id: number;
  title: string;
  content: string;
  videoUrl: string;
  duration: number;
}

interface Section {
  _id: number;
  title: string;
  lessons: Lesson[];
}

type Category = { id: string; name: string; slug: string };

// ---------------------------------------------------------------------------
// LessonRow — inline editable lesson inside a section
// ---------------------------------------------------------------------------

function LessonRow({
  lesson,
  onUpdate,
  onRemove,
}: {
  lesson: Lesson;
  onUpdate: (updated: Lesson) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded bg-background text-sm">
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          className="text-xs text-muted-foreground mr-1"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Collapse lesson" : "Expand lesson"}
        >
          {expanded ? "▾" : "▸"}
        </button>
        <Input
          className="flex-1 h-7 text-sm border-0 bg-transparent p-0 focus-visible:ring-0 shadow-none"
          placeholder="Lesson title"
          value={lesson.title}
          onChange={(e) => onUpdate({ ...lesson, title: e.target.value })}
        />
        <Input
          type="number"
          className="w-20 h-7 text-xs border-border"
          placeholder="min"
          min={0}
          value={lesson.duration === 0 ? "" : lesson.duration}
          onChange={(e) =>
            onUpdate({ ...lesson, duration: Number(e.target.value) || 0 })
          }
        />
        <span className="text-muted-foreground text-xs">min</span>
        <button
          type="button"
          onClick={onRemove}
          className="text-destructive hover:opacity-70 ml-1"
          aria-label="Remove lesson"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-border pt-2">
          <Input
            className="text-sm"
            placeholder="Video URL (optional)"
            value={lesson.videoUrl}
            onChange={(e) => onUpdate({ ...lesson, videoUrl: e.target.value })}
          />
          <textarea
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm min-h-20 resize-none"
            placeholder="Lesson content / notes"
            value={lesson.content}
            onChange={(e) => onUpdate({ ...lesson, content: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SectionCard
// ---------------------------------------------------------------------------

function SectionCard({
  section,
  onUpdate,
  onRemove,
}: {
  section: Section;
  onUpdate: (updated: Section) => void;
  onRemove: () => void;
}) {
  const addLesson = () => {
    const newLesson: Lesson = {
      _id: Date.now(),
      title: "",
      content: "",
      videoUrl: "",
      duration: 0,
    };
    onUpdate({ ...section, lessons: [...section.lessons, newLesson] });
  };

  const updateLesson = (index: number, updated: Lesson) => {
    const lessons = section.lessons.map((l, i) => (i === index ? updated : l));
    onUpdate({ ...section, lessons });
  };

  const removeLesson = (index: number) => {
    onUpdate({
      ...section,
      lessons: section.lessons.filter((_, i) => i !== index),
    });
  };

  return (
    <Card className="bg-secondary">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-end gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-foreground">
              Section Title
            </label>
            <Input
              placeholder="e.g., Getting Started with React"
              value={section.title}
              onChange={(e) => onUpdate({ ...section, title: e.target.value })}
            />
          </div>
          <Button
            size="icon"
            variant="ghost"
            type="button"
            className="text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Lessons in this section
          </label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {section.lessons.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-3">
                No lessons yet — add one below.
              </p>
            )}
            {section.lessons.map((lesson, idx) => (
              <LessonRow
                key={lesson._id}
                lesson={lesson}
                onUpdate={(updated) => updateLesson(idx, updated)}
                onRemove={() => removeLesson(idx)}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full bg-transparent"
            onClick={addLesson}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Lesson
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function CourseCreationPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // ── Basic Info ──────────────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Details ─────────────────────────────────────────────────────────────
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // ── Curriculum ──────────────────────────────────────────────────────────
  const [sections, setSections] = useState<Section[]>([
    { _id: 1, title: "", lessons: [] },
  ]);

  // ── Publish ─────────────────────────────────────────────────────────────
  const [checks, setChecks] = useState({
    original: false,
    quality: false,
    guidelines: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [savedCourseId, setSavedCourseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  // ── Fetch categories on mount ───────────────────────────────────────────
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    }
    fetchCategories();
  }, []);

  // ── Image upload ─────────────────────────────────────────────────────────
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(null);
    setImageUploading(true);

    const fd = new FormData();
    fd.append("image", file);

    const result = await uploadCourseImage(fd);
    setImageUploading(false);

    if (result.success) {
      setImageUrl(result.url);
    } else {
      setImageError(result.error);
    }
  };

  // ── Section helpers ──────────────────────────────────────────────────────
  const addSection = () => {
    setSections((prev) => [
      ...prev,
      { _id: Date.now(), title: "", lessons: [] },
    ]);
  };

  const updateSection = (index: number, updated: Section) => {
    setSections((prev) => prev.map((s, i) => (i === index ? updated : s)));
  };

  const removeSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Build CourseFormData ─────────────────────────────────────────────────
  const buildFormData = (): CourseFormData => ({
    title,
    subtitle: subtitle || undefined,
    image: imageUrl ?? undefined,
    description,
    duration: Number(duration),
    categoryId,
    sections: sections.map((section, sIdx) => ({
      title: section.title,
      order: sIdx,
      lessons: section.lessons.map((lesson, lIdx) => ({
        title: lesson.title,
        content: lesson.content,
        videoUrl: lesson.videoUrl || undefined,
        duration: lesson.duration,
        order: lIdx,
      })),
    })),
  });

  // ── Save as draft ────────────────────────────────────────────────────────
  const handleSave = () => {
    setFormErrors({});
    startTransition(async () => {
      const result = await createCourse(buildFormData());
      if (result.success) {
        setSavedCourseId(result.courseId);
      } else {
        setFormErrors(result.errors);
      }
    });
  };

  // ── Publish ──────────────────────────────────────────────────────────────
  const handlePublish = () => {
    setFormErrors({});

    if (!checks.original || !checks.quality || !checks.guidelines) {
      setFormErrors({
        _form: ["Please confirm all checkboxes before publishing."],
      });
      return;
    }

    startTransition(async () => {
      // Save first if not already saved
      let courseId = savedCourseId;
      if (!courseId) {
        const saveResult = await createCourse(buildFormData());
        if (!saveResult.success) {
          setFormErrors(saveResult.errors);
          return;
        }
        courseId = saveResult.courseId;
        setSavedCourseId(courseId);
      }

      const publishResult = await publishCourse(courseId);
      if (publishResult.success) {
        router.push(`/courses/${courseId}`);
      } else {
        setFormErrors(publishResult.errors);
      }
    });
  };

  // ── Validation helpers (inline) ──────────────────────────────────────────
  const basicComplete = title.trim().length > 0;
  const detailsComplete =
    description.trim().length > 0 &&
    Number(duration) >= 1 &&
    categoryId.trim().length > 0;
  const curriculumComplete =
    sections.length > 0 && sections.every((s) => s.title.trim().length > 0);

  const globalErrors = formErrors._form;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <section className="bg-secondary border-b border-border px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-primary hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Create New Course
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Global errors */}
          {globalErrors && globalErrors.length > 0 && (
            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3">
              {globalErrors.map((err) => (
                <p key={err} className="text-sm text-destructive">
                  {err}
                </p>
              ))}
            </div>
          )}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="publish">Publish</TabsTrigger>
            </TabsList>

            {/* ── Basic Info Tab ──────────────────────────────────────── */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Add the basic details about your course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Course Title *
                    </label>
                    <Input
                      placeholder="Enter course title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    {formErrors.title && (
                      <p className="text-xs text-destructive">
                        {formErrors.title[0]}
                      </p>
                    )}
                  </div>

                  {/* Subtitle */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Course Subtitle
                    </label>
                    <Input
                      placeholder="Brief description of what the course covers"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                    />
                  </div>

                  {/* Image */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Course Image
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <div
                      className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition cursor-pointer relative"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {imageUploading ? (
                        <Loader2 className="w-8 h-8 mx-auto text-muted-foreground animate-spin mb-2" />
                      ) : imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageUrl}
                          alt="Course cover"
                          className="mx-auto max-h-40 rounded object-cover"
                        />
                      ) : (
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        {imageUrl
                          ? "Click to replace image"
                          : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                    {imageError && (
                      <p className="text-xs text-destructive">{imageError}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  disabled={!basicComplete}
                  onClick={() => setActiveTab("details")}
                >
                  Next
                </Button>
              </div>
            </TabsContent>

            {/* ── Details Tab ─────────────────────────────────────────── */}
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Details</CardTitle>
                  <CardDescription>
                    Provide detailed information about your course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Description *
                    </label>
                    <textarea
                      placeholder="Enter a detailed course description"
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground min-h-32 resize-none"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                    {formErrors.description && (
                      <p className="text-xs text-destructive">
                        {formErrors.description[0]}
                      </p>
                    )}
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Duration (hours) *
                    </label>
                    <Input
                      type="number"
                      placeholder="24"
                      min={1}
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                    {formErrors.duration && (
                      <p className="text-xs text-destructive">
                        {formErrors.duration[0]}
                      </p>
                    )}
                  </div>
                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Category *
                    </label>
                    {categoriesLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading categories...
                      </div>
                    ) : (
                      <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {categories.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                    {formErrors.categoryId && (
                      <p className="text-xs text-destructive">
                        {formErrors.categoryId[0]}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("basic")}>
                  Back
                </Button>
                <Button
                  disabled={!detailsComplete}
                  onClick={() => setActiveTab("curriculum")}
                >
                  Next
                </Button>
              </div>
            </TabsContent>

            {/* ── Curriculum Tab ──────────────────────────────────────── */}
            <TabsContent value="curriculum" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Curriculum</CardTitle>
                  <CardDescription>
                    Organize your course content into sections and lessons
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {sections.map((section, idx) => (
                      <SectionCard
                        key={section._id}
                        section={section}
                        onUpdate={(updated) => updateSection(idx, updated)}
                        onRemove={() => removeSection(idx)}
                      />
                    ))}
                  </div>

                  <Button
                    type="button"
                    onClick={addSection}
                    variant="outline"
                    className="w-full bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Section
                  </Button>

                  {formErrors.sections && (
                    <p className="text-xs text-destructive">
                      {formErrors.sections[0]}
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("details")}
                >
                  Back
                </Button>
                <Button
                  disabled={!curriculumComplete}
                  onClick={() => setActiveTab("publish")}
                >
                  Next
                </Button>
              </div>
            </TabsContent>

            {/* ── Publish Tab ─────────────────────────────────────────── */}
            <TabsContent value="publish" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Publish Course</CardTitle>
                  <CardDescription>
                    Review and publish your course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary */}
                  <div className="bg-muted rounded-lg p-4 space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Title:</span>{" "}
                      {title || (
                        <span className="text-muted-foreground italic">
                          Not set
                        </span>
                      )}
                    </p>
                    <p>
                      <span className="font-medium">Duration:</span>{" "}
                      {duration ? (
                        `${duration}h`
                      ) : (
                        <span className="text-muted-foreground italic">
                          Not set
                        </span>
                      )}
                    </p>
                    <p>
                      <span className="font-medium">Category:</span>{" "}
                      {categoryId ? (
                        categories.find((c) => c.id === categoryId)?.name ||
                        "Unknown"
                      ) : (
                        <span className="text-muted-foreground italic">
                          Not set
                        </span>
                      )}
                    </p>
                    <p>
                      <span className="font-medium">Sections:</span>{" "}
                      {sections.length}
                    </p>
                    <p>
                      <span className="font-medium">Lessons:</span>{" "}
                      {sections.reduce((sum, s) => sum + s.lessons.length, 0)}
                    </p>
                  </div>

                  {/* Readiness indicator */}
                  {basicComplete && detailsComplete && curriculumComplete ? (
                    <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <p className="text-sm text-green-900 dark:text-green-100">
                        ✓ Course looks ready to publish.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <p className="text-sm text-yellow-900 dark:text-yellow-100">
                        ⚠ Some required fields are incomplete. Please review
                        earlier tabs.
                      </p>
                      <ul className="mt-2 text-xs text-yellow-800 dark:text-yellow-200 list-disc list-inside space-y-0.5">
                        {!basicComplete && <li>Course title is required</li>}
                        {!detailsComplete && (
                          <li>
                            Description, duration, and category are required
                          </li>
                        )}
                        {!curriculumComplete && (
                          <li>All sections need a title</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Confirmation checkboxes */}
                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-border mt-1"
                        checked={checks.original}
                        onChange={(e) =>
                          setChecks({ ...checks, original: e.target.checked })
                        }
                      />
                      <span className="text-sm text-foreground">
                        Course content is original and properly attributed
                      </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-border mt-1"
                        checked={checks.quality}
                        onChange={(e) =>
                          setChecks({ ...checks, quality: e.target.checked })
                        }
                      />
                      <span className="text-sm text-foreground">
                        Course meets all quality standards
                      </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-border mt-1"
                        checked={checks.guidelines}
                        onChange={(e) =>
                          setChecks({ ...checks, guidelines: e.target.checked })
                        }
                      />
                      <span className="text-sm text-foreground">
                        I agree to the platform guidelines
                      </span>
                    </label>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("curriculum")}
                >
                  Back
                </Button>
                <div className="flex gap-2">
                  {/* Save draft */}
                  <Button
                    variant="outline"
                    onClick={handleSave}
                    disabled={isPending || !basicComplete || !detailsComplete}
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Draft
                  </Button>

                  {/* Publish */}
                  <Button
                    onClick={handlePublish}
                    disabled={
                      isPending ||
                      !basicComplete ||
                      !detailsComplete ||
                      !curriculumComplete ||
                      !checks.original ||
                      !checks.quality ||
                      !checks.guidelines
                    }
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Publish Course
                  </Button>
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

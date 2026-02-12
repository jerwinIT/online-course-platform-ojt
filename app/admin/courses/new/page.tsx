"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lesson, Category, Section } from "@/types/course";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  createCategory,
  deleteCategory,
  getCategories,
  type CourseFormData,
} from "@/server/actions/course";
import { useRouter } from "next/navigation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
// ManageCategoryDialog - Dialog for adding and removing categories
// ---------------------------------------------------------------------------

function ManageCategoryDialog({
  categories,
  selectedCategoryId,
  onCategoryAdded,
  onCategoryDeleted,
}: {
  categories: Category[];
  selectedCategoryId: string;
  onCategoryAdded: (category: Category) => void;
  onCategoryDeleted: (categoryId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"add" | "manage">("add");

  // Add form state
  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [isAdding, startAddTransition] = useTransition();

  // Delete state: tracks which category id is currently being deleted
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteErrors, setDeleteErrors] = useState<Record<string, string>>({});

  const handleNameChange = (name: string) => {
    setCategoryName(name);
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setCategorySlug(slug);
  };

  const handleAdd = () => {
    setAddErrors({});
    startAddTransition(async () => {
      const result = await createCategory(categoryName, categorySlug);
      if (result.success) {
        onCategoryAdded(result.category);
        setCategoryName("");
        setCategorySlug("");
        // Switch to manage tab so the user sees the new entry
        setActiveTab("manage");
      } else {
        const errMap: Record<string, string> = {};
        Object.entries(result.errors).forEach(([key, messages]) => {
          errMap[key] = messages[0];
        });
        setAddErrors(errMap);
      }
    });
  };

  const handleDelete = async (id: string) => {
    setDeleteErrors({});
    setDeletingId(id);
    const result = await deleteCategory(id);
    setDeletingId(null);
    if (result.success) {
      onCategoryDeleted(id);
    } else {
      setDeleteErrors((prev) => ({ ...prev, [id]: result.error }));
    }
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      // Reset form when closing
      setCategoryName("");
      setCategorySlug("");
      setAddErrors({});
      setDeleteErrors({});
      setActiveTab("add");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Manage Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>
            Add new categories or remove existing ones.
          </DialogDescription>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex border-b border-border mb-2">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "add"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("add")}
          >
            Add New
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "manage"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("manage")}
          >
            All Categories
            {categories.length > 0 && (
              <span className="ml-1.5 text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5">
                {categories.length}
              </span>
            )}
          </button>
        </div>

        {/* ── Add tab ── */}
        {activeTab === "add" && (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                placeholder="e.g., Web Development"
                value={categoryName}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={isAdding}
              />
              {addErrors.name && (
                <p className="text-xs text-destructive">{addErrors.name}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category-slug">Slug</Label>
              <Input
                id="category-slug"
                placeholder="e.g., web-development"
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                disabled={isAdding}
              />
              {addErrors.slug && (
                <p className="text-xs text-destructive">{addErrors.slug}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Used in URLs. Only lowercase letters, numbers, and hyphens.
              </p>
            </div>
            {addErrors._form && (
              <p className="text-xs text-destructive">{addErrors._form}</p>
            )}
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isAdding}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAdd}
                disabled={
                  isAdding || !categoryName.trim() || !categorySlug.trim()
                }
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Add Category
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* ── Manage tab ── */}
        {activeTab === "manage" && (
          <div className="py-2 space-y-3">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No categories yet. Switch to &ldquo;Add New&rdquo; to create
                one.
              </p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const isSelected = cat.id === selectedCategoryId;
                  const isBeingDeleted = deletingId === cat.id;
                  const deleteError = deleteErrors[cat.id];

                  return (
                    <li key={cat.id} className="space-y-1">
                      <div
                        className={`flex items-center gap-3 px-3 py-2 rounded-md border ${
                          isSelected
                            ? "border-primary/40 bg-primary/5"
                            : "border-border bg-background"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {cat.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            /{cat.slug}
                          </p>
                        </div>
                        {isSelected && (
                          <span className="text-xs text-primary font-medium shrink-0">
                            In use
                          </span>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-40"
                          disabled={
                            isSelected || isBeingDeleted || !!deletingId
                          }
                          title={
                            isSelected
                              ? "Cannot delete the currently selected category"
                              : "Delete category"
                          }
                          onClick={() => handleDelete(cat.id)}
                        >
                          {isBeingDeleted ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      {deleteError && (
                        <p className="text-xs text-destructive px-3">
                          {deleteError}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// CreateCoursePage — the main form
// ---------------------------------------------------------------------------

export default function CreateCoursePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Active tab
  const [activeTab, setActiveTab] = useState("basic");

  // Form fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      const result = await getCategories();
      if (result.success) {
        setCategories(result.data);
      }
      setLoadingCategories(false);
    };
    loadCategories();
  }, []);

  // Errors
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  // Publish checkboxes
  const [checks, setChecks] = useState({
    original: false,
    quality: false,
    guidelines: false,
  });

  // Image upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------------------
  // Section CRUD
  // ---------------------------------------------------------------------------

  const addSection = () => {
    const newSection: Section = {
      _id: Date.now(),
      title: "",
      lessons: [],
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (index: number, updated: Section) => {
    const updated_sections = sections.map((s, i) =>
      i === index ? updated : s,
    );
    setSections(updated_sections);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  // ---------------------------------------------------------------------------
  // Image upload
  // ---------------------------------------------------------------------------

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const fd = new FormData();
    fd.append("image", file);

    try {
      const result = await uploadCourseImage(fd);
      if (result.success) {
        setImageUrl(result.url);
      } else {
        alert("Image upload failed: " + result.error);
      }
    } catch (err) {
      alert("Image upload error");
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Handlers: save / publish
  // ---------------------------------------------------------------------------

  const handleSave = async () => {
    setFormErrors({});

    const payload: CourseFormData = {
      title,
      subtitle,
      image: imageUrl,
      description,
      duration: computedDuration,
      categoryId,
      sections: sections.map((sec, sIdx) => ({
        title: sec.title,
        order: sIdx,
        lessons: sec.lessons.map((lesson, lIdx) => ({
          title: lesson.title,
          content: lesson.content,
          videoUrl: lesson.videoUrl,
          duration: lesson.duration,
          order: lIdx,
        })),
      })),
    };

    startTransition(async () => {
      const res = await createCourse(payload);
      if (res.success) {
        router.push(`/admin/courses`);
      } else {
        setFormErrors(res.errors);
      }
    });
  };

  const handlePublish = async () => {
    setFormErrors({});

    const payload: CourseFormData = {
      title,
      subtitle,
      image: imageUrl,
      description,
      duration: computedDuration,
      categoryId,
      sections: sections.map((sec, sIdx) => ({
        title: sec.title,
        order: sIdx,
        lessons: sec.lessons.map((lesson, lIdx) => ({
          title: lesson.title,
          content: lesson.content,
          videoUrl: lesson.videoUrl,
          duration: lesson.duration,
          order: lIdx,
        })),
      })),
    };

    startTransition(async () => {
      const res = await createCourse(payload);
      if (!res.success) {
        setFormErrors(res.errors);
        return;
      }

      const pubRes = await publishCourse(res.courseId);
      if (pubRes.success) {
        router.push(`/admin?tab=courses`);
      } else {
        setFormErrors(pubRes.errors);
      }
    });
  };

  // Category handlers
  const handleCategoryAdded = (category: Category) => {
    setCategories((prev) => [...prev, category]);
    setCategoryId(category.id);
  };

  const handleCategoryDeleted = (deletedId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== deletedId));
    // Clear selection if the deleted category was the selected one
    setCategoryId((prev) => (prev === deletedId ? "" : prev));
  };

  // ---------------------------------------------------------------------------
  // Validation helpers
  // ---------------------------------------------------------------------------

  // Compute total duration in minutes by summing all lesson durations
  const computedDuration = sections.reduce(
    (total, sec) =>
      total + sec.lessons.reduce((sum, l) => sum + (l.duration || 0), 0),
    0,
  );

  const basicComplete = title.trim().length > 0;
  const detailsComplete =
    description.trim().length > 0 && categoryId.length > 0;
  const curriculumComplete = sections.every((s) => s.title.trim().length > 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin?tab=courses"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>
          <h1 className="text-3xl font-bold">Create New Course</h1>
          <p className="text-muted-foreground mt-1">
            Build your course step by step
          </p>
        </div>

        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="details" disabled={!basicComplete}>
                Details
              </TabsTrigger>
              <TabsTrigger
                value="curriculum"
                disabled={!basicComplete || !detailsComplete}
              >
                Curriculum
              </TabsTrigger>
              <TabsTrigger
                value="publish"
                disabled={
                  !basicComplete || !detailsComplete || !curriculumComplete
                }
              >
                Publish
              </TabsTrigger>
            </TabsList>

            {/* ── Basic Info Tab ──────────────────────────────────────── */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Start with the essentials — course title and subtitle
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Course Title <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="e.g., Complete React Developer Course"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    {formErrors.title && (
                      <p className="text-xs text-destructive">
                        {formErrors.title[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Subtitle (optional)
                    </label>
                    <Input
                      placeholder="A short tagline for your course"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                    />
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
                    Provide a description, category, and cover image
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Description <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm min-h-32 resize-none"
                      placeholder="What will students learn in this course?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                    {formErrors.description && (
                      <p className="text-xs text-destructive">
                        {formErrors.description[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Category <span className="text-destructive">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          <SelectGroup>
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
                      <ManageCategoryDialog
                        categories={categories}
                        selectedCategoryId={categoryId}
                        onCategoryAdded={handleCategoryAdded}
                        onCategoryDeleted={handleCategoryDeleted}
                      />
                    </div>
                    {formErrors.categoryId && (
                      <p className="text-xs text-destructive">
                        {formErrors.categoryId[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Cover Image (optional)
                    </label>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        {imageUrl ? "Change Image" : "Upload Image"}
                      </Button>
                      {imageUrl && (
                        <span className="text-xs text-muted-foreground">
                          Image uploaded ✓
                        </span>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      onChange={handleImageSelect}
                    />
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
                      {computedDuration > 0 ? (
                        computedDuration >= 60 ? (
                          `${Math.floor(computedDuration / 60)}h ${computedDuration % 60 > 0 ? `${computedDuration % 60}min` : ""}`.trim()
                        ) : (
                          `${computedDuration} min`
                        )
                      ) : (
                        <span className="text-muted-foreground italic">
                          Will be computed from lesson durations
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
                          <li>Description and category are required</li>
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
      </div>
    </div>
  );
}

"use client";
import {
  getDashboardStats,
  getRecentEnrollments,
  getPlatformPerformance,
  getAdminCourses,
  getAdminUsers,
  type PlatformPerformance,
  type AdminCourseItem,
  type AdminUserItem,
  type EnrollmentTrendByCourse,
} from "@/server/actions/dashboard-stat";
import { deleteCourse } from "@/server/actions/course";
import { deleteUser } from "@/server/actions/user";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  BookOpen,
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { updateUserRole } from "@/server/actions/user";
import Footer from "@/components/footer";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
/** Shape for recent enrollment (enrolledAt may be Date from server or string after serialization) */
interface RecentEnrollmentItem {
  id: string;
  enrolledAt: Date | string;
  user: { id: string; name: string | null };
  course: { id: string; title: string };
}

export default function AdminContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCourses: 0 as number,
    totalStudents: 0 as number,
    totalEnrollments: 0 as number,
  });
  useEffect(() => {
    const fetchStats = async () => {
      const stats = await getDashboardStats();
      setStats(stats);
    };
    fetchStats();
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const tab = searchParams.get("tab") ?? "overview"; // 👈 default here
  const [recentEnrollments, setRecentEnrollments] = useState<
    RecentEnrollmentItem[]
  >([]);
  const [performance, setPerformance] = useState<PlatformPerformance | null>(
    null,
  );
  const [courses, setCourses] = useState<AdminCourseItem[]>([]);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [courseToForceDelete, setCourseToForceDelete] = useState<{
    id: string;
    title: string;
    enrollmentCount: number;
  } | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "STUDENT">(
    "STUDENT",
  );
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  useState<EnrollmentTrendByCourse | null>(null);

  const handleDeleteCourse = async (courseId: string, force: boolean = false) => {
    try {
      setDeletingCourseId(courseId);
      const result = await deleteCourse(courseId, force);

      if (!result.success) {
        // Check if this is an enrollment error (needs force deletion)
        if (result.error.includes("student")) {
          // Find the course to get its details
          const course = courses.find((c) => c.id === courseId);
          if (course && course.enrollmentCount > 0) {
            setCourseToForceDelete({
              id: courseId,
              title: course.title,
              enrollmentCount: course.enrollmentCount,
            });
            setDeletingCourseId(null);
            return result;
          }
        }
        // For other errors, show toast
        toast.error(result.error);
        setDeletingCourseId(null);
        return result;
      }

      toast.success("Course deleted successfully!");
      setCourseToForceDelete(null);
      // Refresh the courses list and stats so the stats cards reflect the deletion
      const [list, newStats] = await Promise.all([
        getAdminCourses(),
        getDashboardStats(),
      ]);
      setCourses(list);
      setStats(newStats);
      return result;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to delete course");
      return { success: false, error: "Failed to delete course" };
    } finally {
      setDeletingCourseId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setDeletingUserId(userId);
      const result = await deleteUser(userId);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("User deleted successfully!");
      // Refresh the users list and stats
      const [list, newStats] = await Promise.all([
        getAdminUsers(),
        getDashboardStats(),
      ]);
      setUsers(list);
      setStats(newStats);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleUpdateUserRole = async (
    userId: string,
    role: "ADMIN" | "STUDENT",
  ) => {
    try {
      setEditingUserId(userId);
      const result = await updateUserRole(userId, role);

      if (!result.success) {
        toast.error(result.error || "Failed to update user role");
        return;
      }

      toast.success("User role updated successfully!");
      setEditDialogOpen(false);

      // Refresh the users list
      const list = await getAdminUsers();
      router.push(" admin?tab=users");
      setUsers(list);
    } catch (error) {
      toast.error("Failed to update user role");
    } finally {
      setEditingUserId(null);
    }
  };
  useEffect(() => {
    const fetchRecentEnrollments = async () => {
      const recentEnrollments = await getRecentEnrollments();
      setRecentEnrollments(recentEnrollments);
    };
    fetchRecentEnrollments();
  }, []);
  useEffect(() => {
    const fetchPerformance = async () => {
      const data = await getPlatformPerformance();
      setPerformance(data);
    };
    fetchPerformance();
  }, []);
  useEffect(() => {
    const fetchCourses = async () => {
      const list = await getAdminCourses();
      setCourses(list);
    };
    fetchCourses();
  }, []);
  useEffect(() => {
    const fetchUsers = async () => {
      const list = await getAdminUsers();
      setUsers(list);
    };
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Admin Header */}
      <section className="bg-secondary border-b border-border py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage courses, users, and platform settings
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Courses
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.totalCourses}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Students
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.totalStudents}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Enrollments
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.totalEnrollments}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs
            value={tab}
            onValueChange={(value) => router.replace(`/admin?tab=${value}`)}
            className="space-y-6"
          >
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              {/* <TabsTrigger value="analytics">Analytics</TabsTrigger> */}
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Enrollments</CardTitle>
                    <CardDescription>Latest course enrollments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentEnrollments.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4">
                          No recent enrollments yet.
                        </p>
                      ) : (
                        recentEnrollments.map((enrollment) => (
                          <div
                            key={enrollment.id}
                            className="flex items-center justify-between pb-4 border-b border-border last:border-0"
                          >
                            <div>
                              <p className="font-medium text-foreground">
                                {enrollment.user.name ?? "Unknown"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {enrollment.course.title}
                              </p>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(enrollment.enrolledAt).toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Platform Performance</CardTitle>
                    <CardDescription>Key metrics overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground">
                          Average Course Rating
                        </span>
                        <span className="font-semibold text-primary">
                          {performance?.averageCourseRating != null
                            ? `${performance.averageCourseRating}/5.0`
                            : "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground">Completion Rate</span>
                        <span className="font-semibold text-primary">
                          {performance?.completionRate != null
                            ? `${performance.completionRate}%`
                            : "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground">
                          Student Satisfaction
                        </span>
                        <span className="font-semibold text-primary">
                          {performance?.studentSatisfaction != null
                            ? `${performance.studentSatisfaction}%`
                            : "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground">Monthly Growth</span>
                        <span className="font-semibold text-green-600">
                          {performance?.monthlyGrowth != null
                            ? `${performance.monthlyGrowth >= 0 ? "+" : ""}${performance.monthlyGrowth}%`
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  Manage Courses
                </h2>
                <Link href="/admin/courses/new">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Course
                  </Button>
                </Link>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4">Title</TableHead>
                    <TableHead className="px-4 max-w-[200px]">
                      Description
                    </TableHead>
                    <TableHead className="px-4">Lessons</TableHead>
                    <TableHead className="px-4">Students</TableHead>
                    <TableHead className="px-4">Rating</TableHead>
                    <TableHead className="px-4">Created</TableHead>
                    <TableHead className="px-4 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses
                    .filter(
                      (course) =>
                        !searchQuery.trim() ||
                        course.title
                          .toLowerCase()
                          .includes(searchQuery.trim().toLowerCase()) ||
                        course.description
                          .toLowerCase()
                          .includes(searchQuery.trim().toLowerCase()),
                    )
                    .map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="px-4 font-medium">
                          {course.title}
                        </TableCell>
                        <TableCell className="px-4 max-w-[200px] truncate text-muted-foreground">
                          {course.description}
                        </TableCell>
                        <TableCell className="px-4 text-muted-foreground">
                          {course.lessonCount}
                        </TableCell>
                        <TableCell className="px-4 text-muted-foreground">
                          {course.enrollmentCount}
                        </TableCell>
                        <TableCell className="px-4 text-muted-foreground">
                          {course.averageRating != null
                            ? `${course.averageRating}★`
                            : "—"}
                        </TableCell>
                        <TableCell className="px-4 text-muted-foreground">
                          {new Date(course.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/courses/${course.id}`}>
                              <Button size="icon" variant="ghost">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/courses/${course.id}/edit`}>
                              <Button size="icon" variant="ghost">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-destructive"
                                  disabled={deletingCourseId === course.id}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Course
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete &quot;
                                    {course.title}&quot;? This action cannot be
                                    undone and will remove all course content,
                                    sections, and lessons.
                                    {course.enrollmentCount > 0 && (
                                      <span className="block mt-2 font-semibold text-destructive">
                                        Warning: {course.enrollmentCount} student
                                        {course.enrollmentCount === 1 ? " is" : "s are"}{" "}
                                        currently enrolled in this course.
                                      </span>
                                    )}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteCourse(course.id)
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Force Delete Warning Dialog */}
            <AlertDialog 
              open={courseToForceDelete !== null} 
              onOpenChange={(open) => !open && setCourseToForceDelete(null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-destructive">
                    ⚠️ Students Enrolled in Course
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    <span className="block mb-2">
                      <strong>{courseToForceDelete?.enrollmentCount}</strong> student
                      {courseToForceDelete?.enrollmentCount === 1 ? " is" : "s are"}{" "}
                      currently enrolled in &quot;{courseToForceDelete?.title}&quot;.
                    </span>
                    <span className="block mb-2">
                      Deleting this course will:
                    </span>
                    <ul className="list-disc list-inside space-y-1 ml-2 mb-2">
                      <li>Remove all student enrollments</li>
                      <li>Delete all course content and progress</li>
                      <li>Cannot be undone</li>
                    </ul>
                    <span className="block font-semibold text-destructive">
                      Are you sure you want to proceed?
                    </span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setCourseToForceDelete(null)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (courseToForceDelete) {
                        handleDeleteCourse(courseToForceDelete.id, true);
                      }
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, Delete Anyway
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  Manage Users
                </h2>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4">Name</TableHead>
                    <TableHead className="px-4">Email</TableHead>
                    <TableHead className="px-4">Role</TableHead>
                    <TableHead className="px-4">Enrollments</TableHead>
                    <TableHead className="px-4">Status</TableHead>
                    <TableHead className="px-4">Joined</TableHead>
                    <TableHead className="px-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users
                    .filter((user) => {
                      const q = userSearchQuery.trim().toLowerCase();
                      if (!q) return true;
                      return (
                        user.name?.toLowerCase().includes(q) ||
                        user.email.toLowerCase().includes(q)
                      );
                    })
                    .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="px-4 font-medium">
                          {user.name ?? "—"}
                        </TableCell>
                        <TableCell className="px-4 text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell className="px-4">
                          <Badge
                            variant={
                              user.role === "ADMIN" ? "default" : "secondary"
                            }
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 text-muted-foreground">
                          {user.enrollmentCount}
                        </TableCell>
                        <TableCell className="px-4">
                          <Badge
                            variant={user.isActive ? "default" : "secondary"}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog
                              open={editDialogOpen}
                              onOpenChange={setEditDialogOpen}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedRole(
                                      user.role as "ADMIN" | "STUDENT",
                                    );
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>

                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Edit User</DialogTitle>
                                  <DialogDescription>
                                    Update user role for{" "}
                                    {user.name || user.email}.
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                      Role
                                    </label>
                                    <Select
                                      value={selectedRole}
                                      onValueChange={(value) =>
                                        setSelectedRole(
                                          value as "ADMIN" | "STUDENT",
                                        )
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                      </SelectTrigger>
                                      <SelectContent position="popper">
                                        <SelectGroup>
                                          <SelectItem value="ADMIN">
                                            ADMIN
                                          </SelectItem>
                                          <SelectItem value="STUDENT">
                                            STUDENT
                                          </SelectItem>
                                        </SelectGroup>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                      variant="secondary"
                                      onClick={() => setEditDialogOpen(false)}
                                      disabled={editingUserId === user.id}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleUpdateUserRole(
                                          user.id,
                                          selectedRole,
                                        )
                                      }
                                      disabled={editingUserId === user.id}
                                    >
                                      {editingUserId === user.id
                                        ? "Saving..."
                                        : "Save changes"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-destructive"
                                  disabled={deletingUserId === user.id}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete User
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete &quot;
                                    {user.name || user.email}&quot;? This action
                                    cannot be undone and will remove all user
                                    data and enrollments.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}
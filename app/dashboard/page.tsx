'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Settings,
  LogOut,
  User,
} from 'lucide-react'
import Footer from '@/components/footer'

const ENROLLED_COURSES = [
  {
    id: 1,
    title: 'React Fundamentals',
    instructor: 'Sarah Johnson',
    progress: 65,
    lastAccessed: '2 hours ago',
    totalLessons: 45,
    completedLessons: 29,
  },
  {
    id: 2,
    title: 'Python for Data Science',
    instructor: 'Dr. James Park',
    progress: 30,
    lastAccessed: '1 day ago',
    totalLessons: 52,
    completedLessons: 16,
  },
  {
    id: 3,
    title: 'UI/UX Design Mastery',
    instructor: 'Emma Williams',
    progress: 85,
    lastAccessed: '3 days ago',
    totalLessons: 38,
    completedLessons: 32,
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'
  const user = session?.user
  const displayName = user?.name ?? user?.email ?? 'there'

  useEffect(() => {
    if (status === 'authenticated' && user?.role === 'ADMIN') {
      router.replace('/admin')
    }
  }, [status, user?.role, router])

  if (isLoading || (status === 'authenticated' && user?.role === 'ADMIN')) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-muted" />
          <p className="text-muted-foreground">
            {user?.role === 'ADMIN' ? 'Redirecting to admin…' : 'Loading your dashboard…'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Dashboard Header */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden bg-muted flex-shrink-0 ring-2 ring-border">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-7 h-7 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                  Welcome back, {displayName}
                </h1>
                <p className="text-muted-foreground mt-2">Here&apos;s your learning overview</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/settings">
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" onClick={() => signOut({ callbackUrl: '/' })}>
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Courses Enrolled</p>
                    <p className="text-3xl font-bold text-foreground">3</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Learning Hours</p>
                    <p className="text-3xl font-bold text-foreground">24.5</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Completed Lessons</p>
                    <p className="text-3xl font-bold text-foreground">77</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avg. Progress</p>
                    <p className="text-3xl font-bold text-foreground">60%</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="courses" className="space-y-6">
            <TabsList>
              <TabsTrigger value="courses">My Courses</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="certificates">Certificates</TabsTrigger>
            </TabsList>

            {/* My Courses Tab */}
            <TabsContent value="courses" className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Currently Learning</h2>
                <Link href="/courses">
                  <Button variant="outline">Browse More</Button>
                </Link>
              </div>

              <div className="space-y-4">
                {ENROLLED_COURSES.map((course) => (
                  <Card key={course.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                        <div className="md:col-span-2">
                          <Link
                            href={`/courses/${course.id}`}
                            className="group"
                          >
                            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition mb-1">
                              {course.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground mb-3">{course.instructor}</p>
                          <p className="text-xs text-muted-foreground">
                            Last accessed: {course.lastAccessed}
                          </p>
                        </div>

                        <div className="md:col-span-2">
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-foreground">
                                  {course.progress}% Complete
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {course.completedLessons} of {course.totalLessons} lessons
                                </span>
                              </div>
                              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-primary h-full rounded-full transition-all"
                                  style={{ width: `${course.progress}%` }}
                                />
                              </div>
                            </div>
                            <Link href={`/courses/${course.id}`}>
                              <Button size="sm" className="w-full">
                                Continue Learning
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground mb-6">Recommended For You</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="bg-gradient-to-br from-primary/10 to-accent/10 h-40 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-primary opacity-40" />
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">Recommended Course {i}</CardTitle>
                      <CardDescription>Based on your interests</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        This course matches your learning preferences and goals.
                      </p>
                      <Link href="/courses/1" className="w-full">
                        <Button className="w-full">View Course</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Certificates Tab */}
            <TabsContent value="certificates" className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground mb-6">Your Certificates</h2>

              <div className="space-y-4">
                <Card className="border-2 border-dashed">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">UI/UX Design Mastery</h3>
                          <p className="text-sm text-muted-foreground">Completed on Mar 10, 2024</p>
                        </div>
                      </div>
                      <Button>Download</Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <p className="text-muted-foreground">
                    Complete more courses to earn certificates!
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  )
}

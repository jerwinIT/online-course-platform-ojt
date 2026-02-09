'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Star,
  Users,
  Clock,
  BookOpen,
  CheckCircle,
  Play,
  Award,
  Share2,
  Heart,
} from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const course = {
    id: params.id,
    title: 'React Fundamentals - Build Interactive Web Applications',
    instructor: 'Sarah Johnson',
    instructorBio:
      'Full-stack developer with 10+ years of experience. Passionate about teaching and building beautiful web applications.',
    category: 'Web Development',
    rating: 4.9,
    reviews: 3240,
    students: 45320,
    price: 99.99,
    level: 'Beginner',
    duration: '24 hours',
    language: 'English',
    description:
      'Learn React from scratch and build real-world applications. This comprehensive course covers all the fundamentals you need to become a React developer.',
    about:
      'This course is designed for complete beginners who want to learn React and build interactive web applications. You will learn the core concepts of React including components, hooks, state management, and more. By the end of this course, you will have the skills to build professional React applications.',
    learnings: [
      'Understand React fundamentals and core concepts',
      'Build reusable React components',
      'Master React Hooks and State Management',
      'Work with APIs and fetch data',
      'Deploy React applications to production',
      'Build a complete portfolio project',
    ],
    requirements: [
      'Basic JavaScript knowledge',
      'Understanding of HTML and CSS',
      'A code editor (VS Code recommended)',
      'Node.js and npm installed',
    ],
    sections: [
      {
        title: 'Getting Started with React',
        lessons: 8,
        duration: '3 hours',
      },
      {
        title: 'Components and JSX',
        lessons: 12,
        duration: '5 hours',
      },
      {
        title: 'State and Hooks',
        lessons: 15,
        duration: '6 hours',
      },
      {
        title: 'Advanced Patterns',
        lessons: 10,
        duration: '4 hours',
      },
      {
        title: 'Building Projects',
        lessons: 8,
        duration: '6 hours',
      },
    ],
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 border-b border-border px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Link href="/courses" className="text-primary hover:underline text-sm mb-4 inline-block">
            ← Back to Courses
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-3">
                <Badge className="w-fit">{course.category}</Badge>
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground text-balance">
                  {course.title}
                </h1>
              </div>

              <p className="text-lg text-muted-foreground">{course.description}</p>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-foreground">{course.rating}</span>
                  <span className="text-muted-foreground">({course.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-5 h-5" />
                  <span>{(course.students / 1000).toFixed(1)}K students</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-5 h-5" />
                  <span>{course.duration}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xl font-semibold text-primary">SJ</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{course.instructor}</p>
                  <p className="text-sm text-muted-foreground">Instructor</p>
                </div>
              </div>
            </div>

            {/* Course Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 h-40 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-primary opacity-40" />
                </div>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <span className="text-3xl font-bold text-primary">${course.price}</span>
                  </div>
                  <Button className="w-full" size="lg">
                    Enroll Now
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="flex-1 bg-transparent">
                        <Heart className="w-4 h-4" />
                        Save
                    </Button>
                    <Button variant="outline" size="icon" className="flex-1 bg-transparent">
                        <Share2 className="w-4 h-4" />
                        Share
                    </Button>
                    </div>
                  <div className="pt-4 border-t border-border space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{course.duration} total</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-4 h-4 text-muted-foreground" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Play className="w-4 h-4 text-muted-foreground" />
                      <span>Lifetime access</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Content Tabs */}
      <section className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Tabs defaultValue="about" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
            </TabsList>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">About this course</h2>
                <p className="text-muted-foreground leading-relaxed">{course.about}</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">What you&apos;ll learn</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.learnings.map((learning, i) => (
                    <div key={i} className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{learning}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">Requirements</h3>
                <ul className="space-y-2">
                  {course.requirements.map((req, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-primary font-semibold">•</span>
                      <span className="text-foreground">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            {/* Curriculum Tab */}
            <TabsContent value="curriculum" className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground mb-6">Course Curriculum</h2>
              <div className="space-y-3">
                {course.sections.map((section, i) => (
                  <Card key={i} className="cursor-pointer hover:border-primary transition">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{section.title}</CardTitle>
                          <CardDescription>
                            {section.lessons} lessons • {section.duration}
                          </CardDescription>
                        </div>
                        <span className="text-primary">→</span>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Student Reviews</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-base">Great course for beginners!</CardTitle>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, j) => (
                              <Star
                                key={j}
                                className="w-4 h-4 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">2 weeks ago</span>
                      </div>
                      <CardDescription>By John Doe</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground">
                        Amazing course! Sarah explains everything clearly and the projects are very practical. Highly recommended for anyone starting with React.
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Instructor Tab */}
            <TabsContent value="instructor" className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">About the instructor</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-6">
                    <div className="w-24 h-24 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl font-semibold text-primary">SJ</span>
                    </div>
                    <div className="space-y-3 flex-1">
                      <h3 className="text-xl font-semibold text-foreground">{course.instructor}</h3>
                      <p className="text-muted-foreground">{course.instructorBio}</p>
                      <Button variant="outline" className="mt-4 bg-transparent">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  )
}

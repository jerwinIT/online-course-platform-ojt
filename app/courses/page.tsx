'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Star, Users, Clock, BookOpen, Search } from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

const COURSES = [
  {
    id: 1,
    title: 'React Fundamentals',
    instructor: 'Sarah Johnson',
    category: 'Web Development',
    rating: 4.9,
    reviews: 3240,
    students: 45320,
    price: 99.99,
    level: 'Beginner',
    duration: '24 hours',
  },
  {
    id: 2,
    title: 'Advanced JavaScript Patterns',
    instructor: 'Michael Chen',
    category: 'Web Development',
    rating: 4.8,
    reviews: 2890,
    students: 38210,
    price: 129.99,
    level: 'Advanced',
    duration: '32 hours',
  },
  {
    id: 3,
    title: 'UI/UX Design Mastery',
    instructor: 'Emma Williams',
    category: 'Design',
    rating: 4.7,
    reviews: 2120,
    students: 28900,
    price: 89.99,
    level: 'Beginner',
    duration: '28 hours',
  },
  {
    id: 4,
    title: 'Python for Data Science',
    instructor: 'Dr. James Park',
    category: 'Data Science',
    rating: 4.9,
    reviews: 4560,
    students: 67450,
    price: 119.99,
    level: 'Intermediate',
    duration: '40 hours',
  },
  {
    id: 5,
    title: 'Digital Marketing Bootcamp',
    instructor: 'Lisa Anderson',
    category: 'Marketing',
    rating: 4.6,
    reviews: 1890,
    students: 15640,
    price: 99.99,
    level: 'Beginner',
    duration: '20 hours',
  },
  {
    id: 6,
    title: 'Machine Learning Fundamentals',
    instructor: 'Prof. Alex Kumar',
    category: 'Data Science',
    rating: 4.8,
    reviews: 3120,
    students: 42100,
    price: 149.99,
    level: 'Intermediate',
    duration: '45 hours',
  },
]

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = ['All', 'Web Development', 'Design', 'Data Science', 'Marketing']

  const filteredCourses = COURSES.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Header */}
      <section className="bg-secondary border-b border-border px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Explore Courses</h1>
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

                {/* Categories */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition ${
                          selectedCategory === category
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-secondary text-foreground'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level Filter */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Level</h3>
                  <div className="space-y-2">
                    {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                      <label key={level} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded" />
                        <span className="text-foreground">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Courses Grid */}
            <div className="lg:col-span-3">
              <div className="space-y-4">
                {filteredCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredCourses.map((course) => (
                      <Card
                        key={course.id}
                        className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
                      >
                        <div className="bg-gradient-to-br from-primary/10 to-accent/10 h-40 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-primary opacity-40" />
                        </div>
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <CardTitle className="line-clamp-2 flex-1">{course.title}</CardTitle>
                            <Badge variant="outline" className="whitespace-nowrap">
                              {course.level}
                            </Badge>
                          </div>
                          <CardDescription>{course.instructor}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{course.rating}</span>
                                <span className="text-muted-foreground">({course.reviews})</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="w-4 h-4" />
                                <span>{(course.students / 1000).toFixed(1)}K students</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>{course.duration}</span>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-border">
                              <span className="text-2xl font-bold text-primary">${course.price}</span>
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
                    <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

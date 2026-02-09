'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Upload, Plus, Trash2, Save } from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function CourseCreationPage() {
  const [sections, setSections] = useState([{ id: 1, title: '', lessons: [] }])

  const addSection = () => {
    setSections([
      ...sections,
      { id: Math.max(...sections.map((s) => s.id), 0) + 1, title: '', lessons: [] },
    ])
  }

  const removeSection = (id: number) => {
    setSections(sections.filter((s) => s.id !== id))
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="bg-secondary border-b border-border px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link href="/admin" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Create New Course</h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="publish">Publish</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Add the basic details about your course</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Course Title *</label>
                    <Input placeholder="Enter course title" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Course Subtitle</label>
                    <Input placeholder="Brief description of what the course covers" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Category *</label>
                      <select className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground">
                        <option>Web Development</option>
                        <option>Data Science</option>
                        <option>Design</option>
                        <option>Marketing</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Level *</label>
                      <select className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground">
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Course Image</label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <TabsList className="grid w-auto grid-cols-2">
                  <Button variant="outline">Back</Button>
                  <TabsTrigger value="details" asChild>
                    <Button>Next</Button>
                  </TabsTrigger>
                </TabsList>
              </div>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Details</CardTitle>
                  <CardDescription>Provide detailed information about your course</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Description *</label>
                    <textarea
                      placeholder="Enter a detailed course description"
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground min-h-32 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Learning Objectives</label>
                    <textarea
                      placeholder="What will students learn? (One per line)"
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground min-h-32 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Price ($) *</label>
                      <Input type="number" placeholder="99.99" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Duration (hours) *</label>
                      <Input type="number" placeholder="24" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Language</label>
                      <select className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground">
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Tags</label>
                    <Input placeholder="Add tags separated by commas" />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <TabsTrigger value="basic" asChild>
                  <Button variant="outline">Back</Button>
                </TabsTrigger>
                <TabsTrigger value="curriculum" asChild>
                  <Button>Next</Button>
                </TabsTrigger>
              </div>
            </TabsContent>

            {/* Curriculum Tab */}
            <TabsContent value="curriculum" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Curriculum</CardTitle>
                  <CardDescription>Organize your course content into sections and lessons</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {sections.map((section) => (
                      <Card key={section.id} className="bg-secondary">
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex items-end gap-4">
                            <div className="flex-1 space-y-2">
                              <label className="text-sm font-medium text-foreground">Section Title</label>
                              <Input placeholder="e.g., Getting Started with React" />
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => removeSection(section.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Lessons in this section</label>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              <div className="flex items-center justify-between p-3 bg-background rounded border border-border text-sm">
                                <span>Lesson 1: Introduction</span>
                                <span className="text-muted-foreground">5 min</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-background rounded border border-border text-sm">
                                <span>Lesson 2: Setup</span>
                                <span className="text-muted-foreground">10 min</span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="w-full bg-transparent">
                              <Plus className="w-4 h-4 mr-2" />
                              Add Lesson
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Button onClick={addSection} variant="outline" className="w-full bg-transparent">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Section
                  </Button>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <TabsTrigger value="details" asChild>
                  <Button variant="outline">Back</Button>
                </TabsTrigger>
                <TabsTrigger value="publish" asChild>
                  <Button>Next</Button>
                </TabsTrigger>
              </div>
            </TabsContent>

            {/* Publish Tab */}
            <TabsContent value="publish" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Publish Course</CardTitle>
                  <CardDescription>Review and publish your course</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-sm text-green-900 dark:text-green-100">
                      ✓ Course is ready to publish. Make sure all sections and lessons are complete.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-border mt-1" />
                      <span className="text-sm text-foreground">
                        Course content is original and properly attributed
                      </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-border mt-1" />
                      <span className="text-sm text-foreground">
                        Course meets all quality standards
                      </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-border mt-1" />
                      <span className="text-sm text-foreground">
                        I agree to the platform guidelines
                      </span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Publish Status</label>
                    <select className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground">
                      <option>Draft - Save for later</option>
                      <option>Published - Live immediately</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <TabsTrigger value="curriculum" asChild>
                  <Button variant="outline">Back</Button>
                </TabsTrigger>
                <Button className="gap-2">
                  <Save className="w-4 h-4" />
                  Publish Course
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  )
}

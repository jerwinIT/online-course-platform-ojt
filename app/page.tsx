import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button"
import { Badge } from '@/components/ui/badge'
import Footer from "@/components/footer";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import { BookOpen, Star, Users, ArrowRight, TrendingUp } from "lucide-react";
export default function Home() {
  return (
    <div className="min-h-screen bg-background">
 

      {/* Hero Section */}
      <section className="relative px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <Badge className="w-fit bg-primary/10 text-primary hover:bg-primary/20">
                  Join 500K+ learners
                </Badge>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground text-balance leading-tight">
                  Learn Skills That Matter
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Access world-class courses from industry experts. Learn at your own pace and advance your career.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/courses">
                  <Button size="lg" className="gap-2">
                    Explore Courses
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline">
                  View Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8 h-96 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <BookOpen className="w-24 h-24 mx-auto text-primary opacity-50" />
                  <p className="text-muted-foreground">Online learning platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-secondary py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">10K+</div>
              <p className="text-muted-foreground">Courses Available</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">500K+</div>
              <p className="text-muted-foreground">Active Learners</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">4.8★</div>
              <p className="text-muted-foreground">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Preview */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Featured Courses</h2>
            <p className="text-muted-foreground text-lg">Start learning from our most popular courses</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 h-48 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-primary opacity-40" />
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">Course Title {i}</CardTitle>
                  <CardDescription>By Instructor Name</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">4.8 (2,340 reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>45,320 students</span>
                  </div>
                  <Link href="/courses/1">
                    <Button className="w-full">View Course</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Why Choose LearnHub?</h2>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: BookOpen, title: 'Expert Instructors', desc: 'Learn from industry professionals' },
              { icon: TrendingUp, title: 'Career Growth', desc: 'Advance your skills and career prospects' },
              { icon: Users, title: 'Active Community', desc: 'Learn and network with other students' },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <div key={i} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

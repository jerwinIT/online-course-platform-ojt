'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Users, Target, Lightbulb, Heart, Globe, Award } from 'lucide-react'
import Footer from '@/components/footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="relative px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="space-y-6 text-center">
            <Badge className="inline-block bg-primary/10 text-primary hover:bg-primary/20">
              About LearnHub
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground text-balance leading-tight">
              Empowering the Next Generation of Learners
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We believe education is the most powerful tool for personal and professional transformation. Since 2020, we&apos;ve been making quality learning accessible to everyone, everywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-secondary px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To democratize education by providing affordable, high-quality courses that empower individuals to achieve their goals and transform their lives.
              </p>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Globe className="w-6 h-6 text-primary mt-1" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Global Reach</h3>
                    <p className="text-muted-foreground">Courses accessible in 150+ countries with 50+ languages supported.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Users className="w-6 h-6 text-primary mt-1" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Community Driven</h3>
                    <p className="text-muted-foreground">Building a supportive community of learners from diverse backgrounds.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8 h-96 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Target className="w-24 h-24 mx-auto text-primary opacity-40" />
                <p className="text-muted-foreground">Educational Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Our Core Values</h2>
            <p className="text-lg text-muted-foreground">Principles that guide everything we do</p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Lightbulb,
                title: 'Innovation',
                desc: 'We continuously evolve our platform with cutting-edge technology and pedagogical approaches.',
              },
              {
                icon: Heart,
                title: 'Student First',
                desc: 'Every decision we make prioritizes the success and satisfaction of our learners.',
              },
              {
                icon: Award,
                title: 'Quality',
                desc: 'We maintain the highest standards for our courses and instructor expertise.',
              },
              {
                icon: Globe,
                title: 'Accessibility',
                desc: 'Education should be available to everyone, regardless of background or location.',
              },
              {
                icon: Users,
                title: 'Community',
                desc: 'We foster meaningful connections between learners, instructors, and peers.',
              },
              {
                icon: Target,
                title: 'Impact',
                desc: 'We measure success by the real-world outcomes and career growth of our students.',
              },
            ].map((value, i) => {
              const Icon = value.icon
              return (
                <Card key={i} className="border border-border hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{value.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-secondary px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground">Passionate educators and technologists working together</p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Founder & CEO',
                bio: 'EdTech visionary with 15+ years in education and tech.',
              },
              {
                name: 'Michael Chen',
                role: 'VP of Product',
                bio: 'Former product lead at major learning platforms.',
              },
              {
                name: 'Emily Rodriguez',
                role: 'Head of Curriculum',
                bio: 'Experienced educator with expertise in course design.',
              },
              {
                name: 'David Kumar',
                role: 'CTO',
                bio: 'Tech innovator dedicated to scalable solutions.',
              },
            ].map((member, i) => (
              <Card key={i} className="text-center overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 h-40 flex items-center justify-center">
                  <Users className="w-16 h-16 text-primary opacity-30" />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm font-semibold text-primary">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Our Journey</h2>
            <p className="text-lg text-muted-foreground">Milestones that shaped LearnHub</p>
          </div>

          <div className="space-y-8">
            {[
              {
                year: '2020',
                title: 'Founded',
                desc: 'LearnHub launches with vision to democratize education.',
              },
              {
                year: '2021',
                title: '100K Students',
                desc: 'Reached 100,000 active learners across 50 countries.',
              },
              {
                year: '2022',
                title: '1K Courses',
                desc: 'Expanded course library to over 1,000 courses across diverse topics.',
              },
              {
                year: '2023',
                title: '500K Community',
                desc: 'Hit milestone of 500,000 active learners and 100+ instructors.',
              },
              {
                year: '2024',
                title: 'AI Integration',
                desc: 'Launched AI-powered personalized learning recommendations.',
              },
              {
                year: '2025',
                title: 'Partnerships',
                desc: 'Partnered with leading universities and companies globally.',
              },
            ].map((milestone, i) => (
              <div key={i} className="flex gap-8 items-start">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-primary mt-2" />
                  {i !== 5 && <div className="w-0.5 h-24 bg-border my-2" />}
                </div>
                <div className="pb-8">
                  <Badge className="mb-2 bg-primary/10 text-primary hover:bg-primary/20">
                    {milestone.year}
                  </Badge>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{milestone.title}</h3>
                  <p className="text-muted-foreground">{milestone.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-secondary px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">500K+</div>
              <p className="text-muted-foreground">Active Learners</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <p className="text-muted-foreground">Courses</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">100+</div>
              <p className="text-muted-foreground">Expert Instructors</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">150+</div>
              <p className="text-muted-foreground">Countries</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Join Our Community</h2>
          <p className="text-lg text-muted-foreground">
            Start your learning journey today and be part of a global community transforming lives through education.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/courses">
              <Button size="lg" variant="outline">
                Explore Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

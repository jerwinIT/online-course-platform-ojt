'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BookOpen, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            LearnHub
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/courses"
              className={`transition-colors border-b-2 ${
                pathname.startsWith('/courses')
                  ? 'text-primary border-primary'
                  : 'text-foreground border-transparent hover:text-primary'
              }`}
            >
              Courses
            </Link>
            <Link
              href="/dashboard"
              className={`transition-colors border-b-2 ${
                pathname.startsWith('/dashboard')
                  ? 'text-primary border-primary'
                  : 'text-foreground border-transparent hover:text-primary'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/about"
              className={`transition-colors border-b-2 ${
                pathname === '/about'
                  ? 'text-primary border-primary'
                  : 'text-foreground border-transparent hover:text-primary'
              }`}
            >
              About
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-secondary rounded-lg transition"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link
              href="/courses"
              className={`block px-4 py-2 rounded-lg transition ${
                pathname.startsWith('/courses')
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground hover:bg-secondary'
              }`}
            >
              Courses
            </Link>
            <Link
              href="/dashboard"
              className={`block px-4 py-2 rounded-lg transition ${
                pathname.startsWith('/dashboard')
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground hover:bg-secondary'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/about"
              className={`block px-4 py-2 rounded-lg transition ${
                pathname === '/about'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground hover:bg-secondary'
              }`}
            >
              About
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full bg-transparent">
                  Log In
                </Button>
              </Link>
              <Link href="/signup" className="w-full">
                <Button className="w-full">Sign Up</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

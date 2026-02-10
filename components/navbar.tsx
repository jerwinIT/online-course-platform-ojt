'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BookOpen, Menu, X, CircleUser, LayoutDashboard, LogOut } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated' && session?.user

  function handleSignOut() {
    signOut({ callbackUrl: '/' })
  }

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

          {/* Desktop: Profile dropdown or Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <CircleUser className="w-6 h-6" />
                    <span className="sr-only">Open user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <span className="font-normal">
                      <p className="text-sm font-medium">{session?.user?.name ?? 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {session?.user?.email}
                      </p>
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleSignOut}
                    className="cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline">Log In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
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
              onClick={() => setIsOpen(false)}
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
              onClick={() => setIsOpen(false)}
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
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 text-sm text-muted-foreground border-b border-border">
                    <p className="font-medium text-foreground">{session?.user?.name ?? 'User'}</p>
                    <p className="text-xs truncate">{session?.user?.email}</p>
                  </div>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full bg-transparent">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent text-destructive hover:text-destructive"
                    onClick={() => {
                      setIsOpen(false)
                      handleSignOut()
                    }}
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="w-full" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full bg-transparent">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/auth/signup" className="w-full" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

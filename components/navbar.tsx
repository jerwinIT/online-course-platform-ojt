"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Menu,
  X,
  CircleUser,
  LayoutDashboard,
  LogOut,
  Heart,
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && session?.user;
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";
  const dashboardLabel = isAdmin ? "Admin" : "Dashboard";
  const dashboardHref = isAdmin ? "/admin" : "/dashboard";
  const isDashboardActive = pathname.startsWith(dashboardHref);

  function handleSignOut() {
    signOut({ callbackUrl: "/" });
  }

  return (
    <nav className="border-b border-border bg-[#343A40] sticky top-0 z-50 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-foreground"
          >
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-[#d72323] flex items-center justify-center">
              <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <p className="text-xl lg:text-2xl text-white">LearnHub</p>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10">
            {isAuthenticated && (
              <Link
                href={dashboardHref}
                className={`transition-colors text-base lg:text-lg font-medium ${
                  isDashboardActive
                    ? "text-[#d72323]"
                    : "text-white hover:text-[#d72323]"
                }`}
              >
                {dashboardLabel}
              </Link>
            )}
            <Link
              href="/courses"
              className={`transition-colors text-base lg:text-lg font-medium ${
                pathname.startsWith("/courses")
                  ? "text-[#d72323]"
                  : "text-white hover:text-[#d72323]"
              }`}
            >
              Courses
            </Link>
          </div>

          {/* Desktop: Profile dropdown or Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full relative overflow-hidden w-10 h-10 lg:w-12 lg:h-12 hover:ring-2 hover:ring-[#d72323]">
                    {session?.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name ?? "User avatar"}
                        fill
                      />
                    ) : (
                      <CircleUser className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 lg:w-64">
                  <DropdownMenuLabel>
                    <span className="font-normal">
                      <p className="text-sm lg:text-base font-medium">
                        {session?.user?.name ?? "User"}
                      </p>
                      <p className="text-xs lg:text-sm text-muted-foreground truncate">
                        {session?.user?.email}
                      </p>
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href={dashboardHref}
                      className="flex items-center gap-2 cursor-pointer text-sm lg:text-base"
                    >
                      <LayoutDashboard className="w-4 h-4 lg:w-5 lg:h-5" />
                      {dashboardLabel}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/saved"
                      className="flex items-center gap-2 cursor-pointer text-sm lg:text-base"
                    >
                      <Heart className="w-4 h-4 lg:w-5 lg:h-5" />
                      Saved
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleSignOut}
                    className="cursor-pointer text-sm lg:text-base"
                  >
                    <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="text-sm lg:text-base px-4 lg:px-6 py-2 lg:py-2.5"
              >
                Continue with Gsuite
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-[#d72323]/20 rounded-lg transition text-white"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-3 flex flex-col text-center">
            {isAuthenticated && (
              <Link
                href={dashboardHref}
                className={`block px-4 py-2 rounded-lg transition ${
                  isDashboardActive
                    ? "bg-[#d72323]/20 text-[#d72323] font-medium"
                    : "text-white hover:bg-[#d72323]/10 hover:text-[#d72323]"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {dashboardLabel}
              </Link>
            )}
            <Link
              href="/courses"
              className={`block px-4 py-2 rounded-lg transition ${
                pathname.startsWith("/courses")
                  ? "bg-[#d72323]/20 text-[#d72323] font-medium"
                  : "text-white hover:bg-[#d72323]/10 hover:text-[#d72323]"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Courses
            </Link>

            <div className="flex flex-col gap-2 pt-2">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 text-sm text-muted-foreground border-b border-border">
                    <p className="font-medium text-white">
                      {session?.user?.name ?? "User"}
                    </p>
                    <p className="text-xs truncate text-white/60">{session?.user?.email}</p>
                  </div>
                  <Link href={dashboardHref} onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full bg-transparent text-white border-white/20 hover:border-[#d72323] hover:text-[#d72323]">
                      <LayoutDashboard className="w-4 h-4" />
                      {dashboardLabel}
                    </Button>
                  </Link>
                  <Link href="/saved" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full bg-transparent text-white border-white/20 hover:border-[#d72323] hover:text-[#d72323]">
                      <Heart className="w-4 h-4" />
                      Saved
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent text-destructive border-white/20 hover:text-destructive hover:border-destructive"
                    onClick={() => {
                      setIsOpen(false);
                      handleSignOut();
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => {
                    setIsOpen(false);
                    signIn("google", { callbackUrl: "/dashboard" });
                  }}
                >
                  Continue with Gsuite
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
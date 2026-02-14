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
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-foreground"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            LearnHub
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {isAuthenticated && (
              <Link
                href={dashboardHref}
                className={`transition-colors border-b-2 ${
                  isDashboardActive
                    ? "text-primary border-primary"
                    : "text-foreground border-transparent hover:text-primary"
                }`}
              >
                {dashboardLabel}
              </Link>
            )}
            <Link
              href="/courses"
              className={`transition-colors border-b-2 ${
                pathname.startsWith("/courses")
                  ? "text-primary border-primary"
                  : "text-foreground border-transparent hover:text-primary"
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
                <Button variant="ghost" size="icon" className="rounded-full relative overflow-hidden">
                    {session?.user?.image ? ( // ✅ correct source
                      <Image
                        src={session.user.image}
                        alt={session.user.name ?? "User avatar"}
                        fill
                     
                      />
                    ) : (
                      <CircleUser className="w-6 h-6" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <span className="font-normal">
                      <p className="text-sm font-medium">
                        {session?.user?.name ?? "User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {session?.user?.email}
                      </p>
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href={dashboardHref}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      {dashboardLabel}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/saved"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Heart className="w-4 h-4" />
                      Saved
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
                {/* <img src="/google.svg" alt="Google" className="w-5 h-5" /> */}
                <Button
                  onClick={() =>
                    signIn("google", { callbackUrl: "/dashboard" })
                  }
                >
                  Continue with Gsuite
                </Button>
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
          <div className="md:hidden pb-4 space-y-3 flex flex-col text-center">
            {isAuthenticated && (
              <Link
                href={dashboardHref}
                className={`block px-4 py-2 rounded-lg transition ${
                  isDashboardActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground hover:bg-secondary"
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
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground hover:bg-secondary"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Courses
            </Link>

            <div className="flex flex-col gap-2 pt-2">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 text-sm text-muted-foreground border-b border-border">
                    <p className="font-medium text-foreground">
                      {session?.user?.name ?? "User"}
                    </p>
                    <p className="text-xs truncate">{session?.user?.email}</p>
                  </div>
                  <Link href={dashboardHref} onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full bg-transparent">
                      <LayoutDashboard className="w-4 h-4" />
                      {dashboardLabel}
                    </Button>
                  </Link>
                  <Link href="/saved" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Heart className="w-4 h-4" />
                      Saved
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent text-destructive hover:text-destructive"
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
                <>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setIsOpen(false);
                      signIn("google", { callbackUrl: "/dashboard" });
                    }}
                  >
                    Continue with Gsuite
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

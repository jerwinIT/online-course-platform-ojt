import { BookOpen } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#800000] border-t border-border px-4 sm:px-4 lg:px-6">
      <div className="mx-auto max-w-7xl py-10 lg:py-6">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4 lg:gap-6">
                   {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold  text-foreground"
          >
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-[#d72323] flex items-center justify-center">
              <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-primary-foreground" />
            </div>
            <p className="text-xl lg:text-2xl text-white">LearnHub</p>
          </Link>
            <p className="text-white text-sm lg:text-base">
              Empower your future with world-class online education.
            </p>
          </div>
          <p className="text-white text-sm lg:text-base shrink-0">
            © {new Date().getFullYear()} LearnHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
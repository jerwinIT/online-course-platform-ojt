import { BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary border-t border-border px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl py-10 lg:py-12">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4 lg:gap-6">
            <div className="flex items-center gap-2 font-bold text-lg lg:text-xl text-foreground">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-primary-foreground" />
              </div>
              LearnHub
            </div>
            <p className="text-muted-foreground text-sm lg:text-base">
              | Empower your future with world-class online education.
            </p>
          </div>
          <p className="text-muted-foreground text-sm lg:text-base shrink-0">
            © {new Date().getFullYear()} LearnHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
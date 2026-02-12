import { BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary border-t border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2 font-bold text-lg text-foreground">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              LearnHub
            </div>
            <p className="text-muted-foreground text-sm">
              | Empower your future with world-class online education.
            </p>
          </div>
          <p className="text-muted-foreground text-sm shrink-0">
            © {new Date().getFullYear()} LearnHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

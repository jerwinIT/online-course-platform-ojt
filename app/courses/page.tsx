import Footer from "@/components/footer";
import { getCourses } from "@/server/actions/course";
import CoursesClient from "@/components/contents/course-client";

export default async function CoursesPage() {
  const result = await getCourses();

  if (!result.success) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <section className="bg-secondary border-b border-border py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Explore Courses
            </h1>
            <p className="text-lg text-muted-foreground">
              Find the perfect course to learn new skills and advance your
              career.
            </p>
          </div>
        </section>
        <section className="flex-1 py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center py-12">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Error Loading Courses
              </h3>
              <p className="text-sm text-muted-foreground">{result.error}</p>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <section className="bg-secondary border-b border-border py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Explore Courses
          </h1>
          <p className="text-lg text-muted-foreground">
            Find the perfect course to learn new skills and advance your career.
          </p>
        </div>
      </section>
      <CoursesClient courses={result.data} />

      <Footer />
    </div>
  );
}

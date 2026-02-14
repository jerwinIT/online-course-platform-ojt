import { getCourses, getCategories } from "@/server/actions/course";
import HomePage from "@/components/contents/home-page";
import { LandingChat } from "@/components/chat/landing-chat";

export default async function Home() {
  const [coursesResult, categoriesResult] = await Promise.all([
    getCourses(),
    getCategories(),
  ]);

  const courses = coursesResult.success ? coursesResult.data : [];
  const categories = categoriesResult.success ? categoriesResult.data : [];

  return (
    <div>
      <HomePage courses={courses} categories={categories} />
      <LandingChat />
    </div>
  );
}

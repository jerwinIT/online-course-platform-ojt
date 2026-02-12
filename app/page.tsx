import { getCourses } from "@/server/actions/course";
import HomePage from "@/components/contents/home-page";
import { LandingChat } from "@/components/chat/landing-chat";

export default async function Home() {
  const result = await getCourses();
  const courses = result.success ? result.data : [];
  return (
    <div>
      <HomePage courses={courses} />
      <LandingChat />
    </div>
  );
}

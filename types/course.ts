export interface Lesson {
  _id: number;
  title: string;
  content: string;
  videoUrl: string;
  duration: number;
}

export interface Section {
  _id: number;
  title: string;
  lessons: Lesson[];
}

export type Category = { id: string; name: string; slug: string };

export interface Test{
  id: number;
  test: string;
  link: string;
  course: string;
  section: string;
  year: string;
  metadata: any;
}

export interface Video {
    id: number;
    title: string;
    thumbnailUrl: string;
    youtubeLink: string;
}

export interface ApiResponse{
    count: number;
    next: string | null;
    previous: string | null;
    results: Test[] | Video[];
}

export interface Question {
  number: string;
  text: string;
  points: number;
  subQuestions: SubQuestion[];
}
export interface SubQuestion {
  label: string;
  text: string;
  answer: string | null;
  explanation: string | null;
  hint: string | null;
}

export interface Exam {
  examTitle: string;
  sessionYear: number;
  subject: string;
  section: string;
  duration: string;
  maxPoints: number;
  instructions: string;
  questions: Question[];
}

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
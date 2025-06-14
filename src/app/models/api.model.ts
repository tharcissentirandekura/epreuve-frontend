export interface Test{
    id: number;
    test: string;
    course: string;
    section: string;
    link?: string;
    year?: string;
}

export interface Video {
    id: number;
    title: string;
    thumbnailUrl: string;
    youtubeUrl: string;
}
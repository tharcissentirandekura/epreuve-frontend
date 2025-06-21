import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../reusable/navbar/navbar.component';
import { FooterComponent } from '../../reusable/footer/footer.component';
import { ApiService } from '../../services/api/api.service';
import { DatePipe } from '@angular/common';
import { debounceTime, Subject } from 'rxjs';
import { CourseSectionComponent } from '../../reusable/course-section/course-section.component';

/** Test interface */
interface Test {
  id: number;
  test: string;
  link: string;
  course: string;
  section: string;
  year: string;
}

/** Video interface */
interface Video {
  title:     string;
  thumbnail: string;
  url:       string;
}

@Component({
  selector:    'app-biochimie',
  standalone:  true,
  imports:     [NavbarComponent, FooterComponent, DatePipe, CourseSectionComponent],
  templateUrl: './biochimie.component.html',
  styleUrl:    './biochimie.component.scss'
})
export class BiochimieComponent implements OnInit {
  biochimieTests: Test[]    = [];
  filteredTests:  Test[]    = [];
  uniqueYears:    string[]  = [];
  uniqueCourses:  string[]  = [];

  /** search & filter state */
  searchTerm:     string = '';
  selectedYear:   string = '';
  selectedCourse: string = '';

  /** “Vidéos” mode flag + list */
  showVideos:    boolean = false;
  videoList:     Video[] = [];

  private filterSubject = new Subject<void>();

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // debounce text‐search
    this.filterSubject.pipe(debounceTime(300)).subscribe(() => {
      this.applyFilters();
    });

    // fetch tests
    this.apiService.getDataHandler('tests').subscribe({
      next: (response: any) => {
        this.biochimieTests = response.results.filter((test: any) =>
          test.section === 'BCSCT' ||
          test.section.toLowerCase().includes('bio') ||
          test.section.toLowerCase().includes('chimie')
        );
        this.filteredTests = [...this.biochimieTests];

        // years
        this.uniqueYears = Array.from(
          new Set(this.biochimieTests.map((t: any) => t.year.slice(0, 4)))
        ).sort().reverse();

        // courses
        this.uniqueCourses = Array.from(
          new Set(this.biochimieTests.map(t => t.course))
        ).sort();
      },
      error: (err) => console.error('Error fetching tests:', err)
    });

    // fetch videos
    this.apiService.getDataHandler('videos').subscribe({
      next: (res: any) => {
        this.videoList = res.results.map((v:any)=> ({
          title:     v.title,
          thumbnail: v.thumbnailUrl,
          url:       v.youtubeLink
        }));
      },
      error: (err) => console.error('Error fetching videos:', err)
    });
  }

  /** called by text input (debounced) */
  onFilterChange() {
    this.filterSubject.next();
  }

  applyFilters() {
    let filtered = [...this.biochimieTests];

    // search‐term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(t =>
        t.test.toLowerCase().includes(term) ||
        t.course.toLowerCase().includes(term)
      );
    }

    // year
    if (this.selectedYear) {
      filtered = filtered.filter(t =>
        new Date(t.year).getFullYear().toString() === this.selectedYear
      );
    }

    // course
    if (this.selectedCourse) {
      filtered = filtered.filter(t =>
        t.course === this.selectedCourse
      );
    }

    this.filteredTests = filtered;
  }

  resetFilters() {
    this.searchTerm     = '';
    this.selectedYear   = '';
    this.selectedCourse = '';
    this.filteredTests  = [...this.biochimieTests];
    this.showVideos     = false;   // back to tests‐mode
  }

  trackByTest(_: number, t: Test): number {
    return t.id;
  }

  trackByVideo(_: number, v: Video): string {
    return v.url;
  }
}

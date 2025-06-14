import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../reusable/navbar/navbar.component';
import { FooterComponent } from '../../reusable/footer/footer.component';
import { ApiService } from '../../services/api/api.service';
import { DatePipe} from '@angular/common';
import { debounceTime, Subject } from 'rxjs';
import { CourseSectionComponent } from '../../reusable/course-section/course-section.component';

//test interfarce
interface Test {
  id: number;
  test: string;
  link: string;
  course: string;
  section: string;
  year: string;
}

//Videos interface
interface Video {
  title: string;
  thumbnail: string;
  url: string;
}

@Component({
  selector: 'app-mathphys',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, DatePipe, CourseSectionComponent],
  templateUrl: './mathphys.component.html',
  styleUrl: './mathphys.component.scss'
})

export class MathphysComponent implements OnInit {

  mathPhysTests: Test[] = [];
  filteredTests: Test[] = [];
  uniqueYears: string[] = [];
  uniqueCourses: string[] = [];

  //search and filter state
  searchTerm: string = '';
  selectedYear: string = '';
  selectedCourse: string = '';
  
  //videos mode flag and list
  showVideos: boolean = false;
  videoList: Video[] = [];

  private filterSubject = new Subject<void>();

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    //debounce text search
    this.filterSubject.pipe(debounceTime(300)).subscribe(()=>{
      this.applyFilters()
    });

    //fetch tests
    this.apiService.getDataHandler('tests').subscribe({
      next: (response: Test[]) => {
        this.mathPhysTests = response.filter(test => 
          test.section === 'Math & Physique' || 
          test.section === 'Mathématiques & Physique' || 
          test.section.toLowerCase().includes('math') || 
          test.section.toLowerCase().includes('physique')
        );
        this.filteredTests = [...this.mathPhysTests];

         // years
        this.uniqueYears = Array.from(
          new Set(this.mathPhysTests.map(t => t.year.slice(0, 4)))
        ).sort().reverse();

        // courses
        this.uniqueCourses = Array.from(
          new Set(this.mathPhysTests.map(t => t.course))
        ).sort();
      },
      error: (err) => console.error('Error fetching tests:', err)
    });

    // fetch videos
    this.apiService.getDataHandler('videos').subscribe({
      next: (res: any[]) => {
        this.videoList = res.map(v => ({
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
    let filtered = [...this.mathPhysTests];

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
    this.filteredTests  = [...this.mathPhysTests];
    this.showVideos     = false;   // back to tests‐mode
  }

  trackByTest(_: number, t: Test): number {
    return t.id;
  }

  trackByVideo(_: number, v: Video): string {
    return v.url;
  }
}

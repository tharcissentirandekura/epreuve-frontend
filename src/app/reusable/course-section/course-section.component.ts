import { Component, Input, OnInit } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api/api.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { Test, Video } from '../../models/api.model';
import { PaginatorComponent } from '../paginator/paginator.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-course-section',
  templateUrl: './course-section.component.html',
  styleUrls: ['./course-section.component.scss'],
  imports: [NavbarComponent, FooterComponent, DatePipe, CommonModule, FormsModule, MatIconModule, PaginatorComponent],
  standalone: true
})
export class CourseSectionComponent implements OnInit {
  onCourseSelect(course: string) {
    this.selectedCourse = course;
    this.applyFilters();
  }

  onSearchInput($event: Event) {
    const input = $event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.applyFilters();
  }

  /**
   * Display title shown in the header
   */
  @Input() sectionId!: string;
  @Input() sectionTitle!: string;


  // UI state
  searchTerm = '';
  selectedCourse = '';
  showVideos = false;

  // Data storage
  allTests: Test[] = [];
  filteredTests: Test[] = [];
  uniqueCourses: string[] = [];
  videoList: Video[] = [];

  // pagination data

  // Pagination for tests
  count = 0;
  next: string | null = null;
  previous: string | null = null;
  currentPage = 1;
  totalPages = 0;

  // Pagination for videos
  videoCount = 0;
  videoNext: string | null = null;
  videoPrevious: string | null = null;
  videoCurrentPage = 1;
  videoTotalPages = 0;

  // shared dat
  pageSize = 5; // 

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    /** 
     * Fetch all tests and filter them based on the sectionId and sectionTitle
     * The sectionId is used to filter tests that belong to the specific section
     * The sectionTitle is used to display the title of the section in the header
     * 
     * For post fondemental, it is straightforward to filter tests based on the sectionId
     * For 9éme année, we will need just a placeholder section in the api  like "general" or "9éme année" to 
     * allow us to filter tests based on the section 
     * 
     * This allows is to have a dynamic section that can be reused for different sections
     */

    // this.api.getDataHandler(`tests`).subscribe(tests => {
    //   console.log('Tests fetched:', tests);
    //   this.allTests = tests.results.filter((t:any) => t.section?.toLowerCase().includes(this.sectionId?.toLowerCase()));
    //   this.uniqueCourses = Array.from(new Set(this.allTests.map((t:any) => t.course)));
    //   this.applyFilters();
    // });

    // this.api.getDataHandler('videos').subscribe(videos => {
    //  /**
    //   * Filter videos based on the sectionId
    //   * For now I am ignoring it because api doesn't have section or sectionId on videos
    //   * In the future, if the API is updated to include sectionId, we can filter videos accordingly
    //   * this.videoList = videos.results.filter((v:any) => v.section.toLowerCase().includes(this.sectionId.toLowerCase()));
    //   */
    //   this.videoList = videos.results;
    // });

    this.loadTests();
    this.loadVideos();
  }

  loadTests(): void {
    this.api.getDataHandler(`tests`, this.currentPage).subscribe(response => {
      this.allTests = response.results.filter((t: any) =>
        t.section?.toLowerCase().includes(this.sectionId?.toLowerCase())
      );
      this.uniqueCourses = Array.from(new Set(this.allTests.map((t: any) => t.course)));
      this.count = response.count;
      this.next = response.next;
      this.previous = response.previous;
      this.totalPages = Math.ceil(this.count / this.pageSize); // Assuming 5 items per page

      this.applyFilters();
      console.log('Total tests:', this.allTests);
    });

  }

  loadVideos(): void {
    // handle pagination for videos
    this.api.getDataHandler(`videos`, this.videoCurrentPage).subscribe({
      next: videos => {
        this.videoList = videos.results;
        this.videoCount = videos.count;
        this.videoNext = videos.next;
        this.videoPrevious = videos.previous;
        this.videoTotalPages = Math.ceil(this.videoCount / this.pageSize); // Assuming 5 items per page
        // this.uniqueCourses = Array.from(new Set(this.videoList.map((v:any) => v.course)));
        console.log('Total videos:', this.videoCount);
        this.applyFilters();
      },
      error: err => {
        if (err.status === 404) {
          console.warn(`No videos on page ${this.videoCurrentPage}`);
        }
        this.videoList = [];
      }
    });

  }

  goToPage(page: number): void {
    if (this.showVideos) {
      if (page < 1 || page > this.videoTotalPages) return;
      this.videoCurrentPage = page;
      this.loadVideos();
    } else {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
      this.loadTests();
    }
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredTests = this.allTests.filter(t => {
      // Filter section course based on the selected course and search term 
      const matchCourse = t.test.toLowerCase().includes(this.selectedCourse.toLowerCase());
      const matchSearch = term ? t.test.toLowerCase().includes(term) : true;

      return matchCourse && matchSearch;
    });

  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCourse = '';
    this.showVideos = false;
    this.applyFilters();
  }

  showTestList(): void {
    this.showVideos = false;
  }

  showVideoList(): void {
    this.showVideos = true;
  }

  trackByTest(_idx: number, test: Test): number {
    return test.id;
  }

  trackByVideo(_idx: number, video: Video): number {
    return video.id;
  }
}
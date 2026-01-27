import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  DestroyRef,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ApiService } from '../../services/api/api.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { Test, Video } from '../../models/api.model';
import { PaginatorComponent } from '../paginator/paginator.component';
import { IdEncoderService } from '../../services/id-encoder.service';
@Component({
  selector: 'app-course-section',
  templateUrl: './course-section.component.html',
  styleUrls: ['./course-section.component.scss'],
  imports: [
    NavbarComponent,
    FooterComponent,
    CommonModule,
    FormsModule,
    PaginatorComponent,
    RouterLink,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseSectionComponent implements OnInit {
  // Modern injection (I am changing it from constructor based)
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly idEncoder = inject(IdEncoderService);

  // Inputs
  sectionId = input.required<string>();
  sectionTitle = input.required<string>();

  // UI state
  searchTerm = '';
  selectedCourse = '';
  showVideos = false;

  // Data storage
  allTests: Test[] = [];
  filteredTests: Test[] = [];
  uniqueCourses: string[] = [];
  videoList: Video[] = [];

  // Pagination for tests
  count = 0;
  next: string | null = null;
  previous: string | null = null;
  currentPage = 1;
  totalPages = 0;
  pageSize = 5;

  ngOnInit(): void {
    this.loadTests();
    this.loadVideos();
  }

  onCourseSelect(course: string): void {
    this.selectedCourse = course;
    this.applyFilters();
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.currentPage = 1; // Reset to first page
    this.loadTests(); // Re-fetch with search
  }

  loadTests(): void {
    // Combine sectionId and searchTerm for server-side filtering
    const searchQuery = this.searchTerm
      ? `${this.sectionId()} ${this.searchTerm}`
      : this.sectionId();

    this.api
      .getDataHandler('tests', this.currentPage, searchQuery)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.allTests = response.results;
          this.uniqueCourses = [
            ...new Set(this.allTests.map((t: Test) => t.course)),
          ];
          this.count = response.count;
          this.next = response.next;
          this.previous = response.previous;
          this.totalPages = Math.ceil(this.count / this.pageSize);
          this.applyFilters();
          this.cdr.markForCheck(); // Trigger change detection for OnPush
        },
        error: (err) => {
          console.error('Error loading tests:', err);
          this.allTests = [];
          this.filteredTests = [];
          this.cdr.markForCheck();
        },
      });
  }

  loadVideos(): void {
    this.api
      .getDataHandler('videos', 1)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (videos) => {
          this.videoList = videos.results || [];
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.warn('No videos available:', err.message);
          this.videoList = [];
          this.cdr.markForCheck();
        },
      });
  }

  normalizeCourseName(test: Test): string {
    const fileName = test.test.split(' ');
    const type = fileName[0];
    const course = test.course;
    const year = test.year.split('-')[0];
    return `${type} de ${course} année ${year}`.trim();
  }

  convertFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return 'Inconnue';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  goToPage(page: number): void {
    if (this.showVideos) return;
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadTests();
  }

  // Only filters by selected course (search is handled by API)
  applyFilters(): void {
    this.filteredTests = this.selectedCourse
      ? this.allTests.filter(
        (t) => t.course.toLowerCase() === this.selectedCourse.toLowerCase()
      )
      : this.allTests;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCourse = '';
    this.showVideos = false;
    this.currentPage = 1;
    this.loadTests();
  }

  trackByTest(_idx: number, test: Test): number {
    return test.id;
  }

  trackByVideo(_idx: number, video: Video): number {
    return video.id;
  }

  /**
   * Encode test ID for secure navigation
   */
  encodeTestId(testId: number): string {
    try {
      return this.idEncoder.encode(testId);
    } catch (error) {
      console.error('Error encoding test ID:', error);
      return testId.toString(); // Fallback to plain ID if encoding fails
    }
  }

  /**
   * Navigate to test mode selection with encoded ID
   */
  navigateToTestMode(testId: number): void {
    const encodedId = this.encodeTestId(testId);
    this.router.navigate(['/testmode', encodedId]);
  }
}

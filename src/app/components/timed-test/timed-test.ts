import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnDestroy, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../services/api/exam.service';
import { Exam, Question as ApiQuestion } from '../../models/api.model';
import { FormsModule } from '@angular/forms';
import { TestHeader } from '../test-header/test-header';
import { NavbarComponent } from "../../reusable/navbar/navbar.component";

interface Question extends ApiQuestion {
  userAnswer?: string;
}

@Component({
  selector: 'app-timed-test',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent,MarkdownModule],
  templateUrl: './timed-test.html',
  styleUrls: ['./timed-test.scss'],
  host: { 'ngSkipHydration': '' } 

})
export class TimedTest implements OnInit, OnDestroy {
  exam: Exam | null = null;
  questions: Question[] = [];
  currentQuestionIndex = 0;
  timeRemaining = 1800;
  isUnlimitedMode = false;
  private timerInterval: any;

  constructor(
    private examService: ExamService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadExam();

    const mode = this.route.snapshot.queryParamMap.get('mode');
    if (mode === 'unlimited') {
      this.isUnlimitedMode = true;
      this.timeRemaining = Number.MAX_SAFE_INTEGER;
    } else {
      this.startTimer();
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  loadExam(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.examService.getExamContent(id).subscribe({
      next: (data: Exam) => {
        this.exam = data;

        if (this.exam?.questions) {
          this.questions = this.exam.questions.map((q, index): Question => ({
            ...q,
            number: typeof q.number === 'string' ? parseInt(q.number, 10) || index + 1 : (q.number ?? index + 1),
            userAnswer: ''
          }));
        }

        if (this.exam?.duration) {
          // convert duration to seconds
          console.log("Time :", this.exam.duration)
          const durationParts = String(this.exam.duration).split('h');
          const hours = parseInt(durationParts[0], 10) || 0;
          const minutes = parseInt(durationParts[1], 10) || 0;
          this.timeRemaining = hours * 3600 + minutes * 60;
        }
      },
      error: (err: Error) => {
        console.error('Error loading exam:', err);
      }
    });
  }

  get currentQuestion(): Question | null {
    return this.questions[this.currentQuestionIndex] || null;
  }
  // setQuestionText(md: string) {
  //   this.markdownText = this.sanitizer.bypassSecurityTrustHtml(marked(md));
  // }
  // SSR-safe timer
  startTimer(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.timerInterval = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining -= 1;
      } else {
        this.submitTest();
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  

  getProgress(): number {
    return this.questions.length > 0
      ? ((this.currentQuestionIndex + 1) / this.questions.length) * 100
      : 0;
  }

  nextQuestion(): void {
    console.log("move")
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  goToQuestion(index: number): void {
    this.currentQuestionIndex = index;
  }

  submitTest(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.saveAnswers();
    this.router.navigate(['/test-results']);
  }

  saveAnswers(): void {
    console.log('Saving answers...', this.questions);
  }

  downloadExam(): void {
    console.log('Downloading exam...');
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}

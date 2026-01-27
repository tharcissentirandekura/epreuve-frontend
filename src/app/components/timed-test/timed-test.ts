import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnDestroy, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../services/api/exam.service';
import { Exam, Question as ApiQuestion, SubQuestion } from '../../models/api.model';
import { NavbarComponent } from '../../reusable/navbar/navbar.component';
import { TestTimerComponent } from './components/test-timer/test-timer';
import { TestProgressComponent } from './components/test-progress/test-progress';
import { QuestionCardComponent } from './components/question-card/question-card';
import { QuestionNavigatorComponent } from './components/question-navigator/question-navigator';

interface Question extends ApiQuestion {
  userAnswer?: string;
}

@Component({
  selector: 'app-timed-test',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    TestTimerComponent,
    TestProgressComponent,
    QuestionCardComponent,
    QuestionNavigatorComponent
  ],
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
      next: (data) => {
        this.exam = data.json_content;

        if (this.exam?.questions) {
          this.questions = this.exam.questions.map((q, index): Question => ({
            ...q,
            number: typeof q.number === 'string' ? parseInt(q.number, 10) || index + 1 : (q.number ?? index + 1),
            userAnswer: '',
            subQuestions: this.initializeSubQuestions(q.subQuestions)
          }));
        }

        if (this.exam?.duration) {
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

  private initializeSubQuestions(subQuestions: SubQuestion[] | undefined): SubQuestion[] {
    if (!subQuestions) return [];
    return subQuestions.map(sq => ({
      ...sq,
      userAnswer: '',
      showHint: false,
      showAnswer:false,
      showExplanation:false,
      subQuestions: this.initializeSubQuestions(sq.subQuestions)
    }));
  }

  get currentQuestion(): Question | null {
    return this.questions[this.currentQuestionIndex] || null;
  }

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

  nextQuestion(): void {
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

  goBack(): void {
    this.router.navigate(['/']);
  }
}

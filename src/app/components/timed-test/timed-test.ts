import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../services/api/exam.service';
import { Exam } from '../../models/api.model';
import { FormsModule } from '@angular/forms';
import { TestHeader } from '../test-header/test-header';
import { Question as ApiQuestion } from '../../models/api.model';


interface Question extends ApiQuestion {
  userAnswer?: string;
}

@Component({
  selector: 'app-timed-test',
  imports: [CommonModule, FormsModule, TestHeader],
  templateUrl: './timed-test.html',
  styleUrl: './timed-test.scss',
  standalone:true
})
export class TimedTest implements OnInit, OnDestroy{

  exam: Exam | null = null;
  questions: Question[] = [];
  currentQuestionIndex = 0;
  timeRemaining = 1800;
  isUnlimitedMode = false;
  private timerInterval: any;

  constructor(
    private examService: ExamService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadExam();
    const mode = this.route.snapshot.queryParamMap.get('mode');
    if (mode === 'unlimited') {
      this.isUnlimitedMode = true;
      // For unlimited mode, set a very high time to effectively disable timer
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
          this.timeRemaining = this.exam.duration;
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

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
      } else {
        this.submitTest();
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getProgress(): number {
    return this.questions.length > 0
      ? ((this.currentQuestionIndex + 1) / this.questions.length) * 100
      : 0;
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

  downloadExam(): void {
    console.log('Downloading exam...');
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

}

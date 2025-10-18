import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../services/api/exam.service';
import { Exam } from '../../models/api.model';

@Component({
  selector: 'app-exam-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-viewer.component.html',
  styleUrl: './exam-viewer.component.scss'
})
export class ExamViewerComponent implements OnInit {
  exam: Exam | null = null;
  loading = true;
  error = '';
  showAnswers: { [key: number]: { [key: number]: boolean } } = {};

  constructor(
    private examService: ExamService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadExam();
  }

  loadExam(): void {
    this.loading = true;
    this.error = '';
    
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.examService.getExamContent(id).subscribe({
      next: (data) => {
        this.exam = data;
        this.loading = false;
        this.initializeAnswerVisibility();
      },
      error: (err) => {
        this.error = 'Erreur de chargement de l\'examen';
        this.loading = false;
        console.error('Error loading exam:', err);
      }
    });
  }

  retry(): void {
    this.loadExam();
  }

  toggleAnswer(questionIndex: number, subQuestionIndex: number): void {
    if (!this.showAnswers[questionIndex]) {
      this.showAnswers[questionIndex] = {};
    }
    this.showAnswers[questionIndex][subQuestionIndex] = !this.showAnswers[questionIndex][subQuestionIndex];
  }

  private initializeAnswerVisibility(): void {
    if (this.exam?.questions) {
      this.exam.questions.forEach((question, questionIndex) => {
        this.showAnswers[questionIndex] = {};
        question.subQuestions?.forEach((_, subQuestionIndex) => {
          this.showAnswers[questionIndex][subQuestionIndex] = false;
        });
      });
    }
  }

  saveAnswers(): void {
    // TODO: Implement save functionality
    console.log('Saving answers...');
  }

  downloadExam(): void {
    // TODO: Implement download functionality
    console.log('Downloading exam...');
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  onTextareaFocus(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    if (target) {
      target.style.borderColor = '#005ea2';
    }
  }

  onTextareaBlur(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    if (target) {
      target.style.borderColor = '#e5ecf3';
    }
  }
}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KatexPipe } from '../../pipes/katex.pipe';
import { ExamService } from '../../services/api/exam.service';
import { Exam } from '../../models/api.model';

@Component({
  selector: 'app-exam-viewer',
  standalone: true,
  imports: [CommonModule, KatexPipe],
  templateUrl: './exam-viewer.component.html',
  styleUrl: './exam-viewer.component.scss'
})
export class ExamViewerComponent implements OnInit {
  exam: Exam | null = null;

  constructor(
    private examService: ExamService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadExam();
  }

  loadExam(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.examService.getExamContent(id).subscribe({
      next: (data) => {
        this.exam = data.json_content;
      },
      error: (err) => {
        console.error('Error loading exam:', err);
      }
    });
  }

  saveAnswers(): void {
    console.log('Saving answers...');
  }

  downloadExam(): void {
    console.log('Downloading exam...');
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
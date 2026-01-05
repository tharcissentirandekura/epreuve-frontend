import { Component, OnInit } from '@angular/core';
import { TestHeader } from '../test-header/test-header';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface QuestionResult {
  number: number;
  text: string;
  subject?: string;
  userAnswer?: string;
  correctAnswer?: string;
  isCorrect: boolean;
  points: number;
  earnedPoints: number;
  explanation?: string;
  steps?: string[];
}

@Component({
  selector: 'app-test-results',
  imports: [TestHeader, CommonModule],
  templateUrl: './test-results.html',
  styleUrl: './test-results.scss',
  standalone:true
})
export class TestResults implements OnInit {

  results: QuestionResult[] = [];
  expandedQuestion: number | null = null;
  correctCount = 0;
  incorrectCount = 0;
  totalQuestions = 0;
  scorePercentage = 0;

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadResults();
    this.calculateStats();
  }

  loadResults() {
    this.results = Array.from({ length: 13 }, (_, i) => ({
      number: i + 1,
      text: `Sample question ${i + 1} text. This will be replaced with actual question data.`,
      subject: i % 3 === 0 ? 'physics' : i % 3 === 1 ? 'chemistry' : 'math',
      userAnswer: '',
      correctAnswer: 'Sample correct answer',
      isCorrect: false,
      points: 10,
      earnedPoints: 0,
      explanation: 'This is a detailed explanation of the solution.',
      steps: [
        'First, identify the given values',
        'Apply the appropriate formula',
        'Substitute the values',
        'Calculate the result'
      ]
    }));
  }

  calculateStats() {
    this.totalQuestions = this.results.length;
    this.correctCount = this.results.filter(r => r.isCorrect).length;
    this.incorrectCount = this.totalQuestions - this.correctCount;
    this.scorePercentage = Math.round((this.correctCount / this.totalQuestions) * 100);
  }

  toggleQuestion(questionNumber: number) {
    if (this.expandedQuestion === questionNumber) {
      this.expandedQuestion = null;
    } else {
      this.expandedQuestion = questionNumber;
    }
  }

  goHome() {
    this.router.navigate(['/testmode']);
  }

}

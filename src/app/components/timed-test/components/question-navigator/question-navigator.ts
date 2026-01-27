import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../../../../models/api.model';

@Component({
  selector: 'app-question-navigator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './question-navigator.html'
})
export class QuestionNavigatorComponent {
  questions = input.required<Question[]>();
  currentIndex = input.required<number>();
  navigate = output<number>();

  hasAnswer(q: Question): boolean {
    if (q.userAnswer) return true;
    return q.subQuestions?.some(sq => this.hasSubAnswer(sq)) ?? false;
  }

  private hasSubAnswer(sq: any): boolean {
    if (sq.userAnswer) return true;
    return sq.subQuestions?.some((nested: any) => this.hasSubAnswer(nested)) ?? false;
  }
}

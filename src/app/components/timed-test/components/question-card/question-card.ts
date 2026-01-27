import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KatexPipe } from '../../../../pipes/katex.pipe';
import { Question } from '../../../../models/api.model';
import { SubquestionComponent } from '../subquestion/subquestion';

@Component({
  selector: 'app-question-card',
  standalone: true,
  imports: [CommonModule, FormsModule, KatexPipe, SubquestionComponent],
  templateUrl: './question-card.html'
})
export class QuestionCardComponent {
  question = input.required<Question>();
}

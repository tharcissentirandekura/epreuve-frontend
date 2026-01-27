import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KatexPipe } from '../../../../pipes/katex.pipe';
import { SubQuestion } from '../../../../models/api.model';

@Component({
  selector: 'app-subquestion',
  standalone: true,
  imports: [CommonModule, FormsModule, KatexPipe],
  templateUrl: './subquestion.html'
})
export class SubquestionComponent {
  subQuestion = input.required<SubQuestion>();
  index = input<string | number>(0);
  depth = input<number>(0);

  toggleHint(): void {
    const sq = this.subQuestion();
    sq.showHint = !sq.showHint;
  }
}

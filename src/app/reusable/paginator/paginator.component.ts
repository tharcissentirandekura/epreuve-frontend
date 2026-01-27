import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  imports: [CommonModule],
  styleUrls: ['./paginator.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})

/**
 * This works like a linkedlist, we have next and previous. 
 * So, we always hold a head, and move to next from the head if head.next is not null
 * and we go back to previous if head.previous is not null
 */
export class PaginatorComponent {
  //Use signal based input/output
  totalPages = input<number>(1);
  currentPage = input<number>(1);
  next = input<string | null>(null);
  previous = input<string | null>(null);
  count = input<number>(0);
  pageSize = input<number>(10);
  pageChange = output<number>();

  // computed for memoization (automatically memoized)
  resultsInfo = computed(() =>{
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = Math.min(this.currentPage() * this.pageSize(), this.count());
    return `${start}-${end} sur ${this.count()} résultats`;
  });

  goToPrevious(): void {
    if (this.previous() && this.currentPage() > 1) { // it is always has revious if there is next unless the firs page
      this.pageChange.emit(this.currentPage() - 1);
    }
  }

  goToNext(): void {
    if (this.next() && this.currentPage() < this.totalPages()) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }
}

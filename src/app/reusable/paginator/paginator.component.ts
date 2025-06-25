import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  imports: [CommonModule],
  styleUrls: ['./paginator.component.scss'],
  standalone: true

})

export class PaginatorComponent {
  @Input() totalPages: number = 1;
  @Input() currentPage: number = 1;
  @Input() endpoint: string | null = null;
  @Input() next : string | null = null;
  @Input() previous : string | null = null;
  @Input() count: number = 0;
  @Input() pageSize: number = 5;
  @Output() pageChange = new EventEmitter<number>();

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}


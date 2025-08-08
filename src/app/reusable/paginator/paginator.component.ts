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
  @Input() next: string | null = null;
  @Input() previous: string | null = null;
  @Input() count: number = 0;
  @Input() pageSize: number = 10;
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  goToPrevious(): void {
    if (this.previous && this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  goToNext(): void {
    if (this.next && this.currentPage < this.totalPages) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newPageSize = parseInt(target.value, 10);
    this.pageSizeChange.emit(newPageSize);
  }

  getResultsInfo(): string {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.count);
    return `${start}-${end} sur ${this.count} résultats`;
  }
}

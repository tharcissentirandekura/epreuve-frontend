import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast/toast.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts" 
           class="toast show" 
           [ngClass]="'toast-' + toast.type"
           role="alert">
        <div class="toast-body d-flex align-items-center">
          <i class="me-2" [ngClass]="getIcon(toast.type)"></i>
          {{ toast.message }}
          <button type="button" 
                  class="btn-close ms-auto" 
                  (click)="removeToast(toast.id)"></button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1050;
      max-width: 350px;
    }

    .toast {
      margin-bottom: 10px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
    }

    .toast-success {
      background-color: #d1edff;
      border-left: 4px solid #0d6efd;
      color: #0d6efd;
    }

    .toast-error {
      background-color: #f8d7da;
      border-left: 4px solid #dc3545;
      color: #721c24;
    }

    .toast-body {
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 500;
    }

    .btn-close {
      font-size: 12px;
      opacity: 0.7;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
    toasts: Toast[] = [];
    private subscription?: Subscription;

    constructor(private toastService: ToastService) { }

    ngOnInit() {
        this.subscription = this.toastService.toasts$.subscribe(
            toasts => this.toasts = toasts
        );
    }

    ngOnDestroy() {
        this.subscription?.unsubscribe();
    }

    removeToast(id: string) {
        this.toastService.remove(id);
    }

    getIcon(type: string): string {
        switch (type) {
            case 'success': return 'bi bi-check-circle-fill';
            case 'error': return 'bi bi-exclamation-triangle-fill';
            default: return 'bi bi-info-circle-fill';
        }
    }
}
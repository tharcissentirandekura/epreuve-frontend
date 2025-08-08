import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast/toast.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './toast.component.html',
    styleUrls: ['./toast.component.scss']
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
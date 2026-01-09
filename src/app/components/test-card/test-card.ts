import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ExamService } from '../../services/api/exam.service';
import { ToastService } from '../../services/toast/toast.service';

@Component({
  selector: 'app-test-card',
  imports: [CommonModule],
  templateUrl: './test-card.html',
  styleUrl: './test-card.scss',
  standalone:true
})
export class TestCard implements OnInit {

  @Input() icon: string = '';
  @Input() iconClass: string = '';
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() buttonText: string = '';
  @Input() buttonClass: string = 'btn-primary';
  @Input() route: string = '';
  @Input() testId?: number;

  constructor(
    private router: Router,
    private examService: ExamService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    if(!this.testId && this.route){
      const match = this.route.match(/\/timedtest\/(\d+)/);
      if (match){
        this.testId = Number(match[1]);
      }
    }
  }

  onStartTest() {
    console.log('onStartTest called', { route: this.route, testId: this.testId });
    
    if (this.route && this.testId) {
      // Check if exam is available before navigating
      this.examService.checkExamAvailability(this.testId).subscribe({
        next: (isAvailable) => {
          console.log('Exam availability check:', isAvailable);
          if (isAvailable) {
            this.navigateToTest();
          } else {
            this.toastService.error('This test does not have online content available.');
          }
        },
        error: (err) => {
          console.error('Availability check error:', err);
          // If check fails, still try to navigate (maybe the endpoint doesn't support HEAD)
          this.navigateToTest();
        }
      });
    } else if (this.route) {
      // Fallback: navigate without checking if testId is not available
      console.log('Navigating without testId check');
      this.navigateToTest();
    } else {
      console.log(`Starting ${this.title}`);
    }
  }

  private navigateToTest(): void {
    if (!this.route) {
      console.error('No route provided');
      return;
    }

    const [path, queryString] = this.route.split('?');
    const queryParams: { [key: string]: string } = {};
    
    if (queryString) {
      queryString.split('&').forEach(param => {
        const [key, value] = param.split('=');
        if (key && value) {
          queryParams[key] = decodeURIComponent(value);
        }
      });
    }
    
    console.log('Navigating to:', path, 'with params:', queryParams);
    
    this.router.navigate([path], { 
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined 
    }).then(
      (success) => console.log('Navigation success:', success),
      (error) => console.error('Navigation error:', error)
    );
  }
}
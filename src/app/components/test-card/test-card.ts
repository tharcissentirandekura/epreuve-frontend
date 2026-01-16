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
    // TODO: remove it later
    console.debug('onStartTest called', { route: this.route, testId: this.testId });
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
      () => {this.toastService.success('Navigation success');},
      () => {this.toastService.error('Erreur de charger le test');}
    );
  }
}
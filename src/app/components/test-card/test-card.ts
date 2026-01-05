import { CommonModule } from '@angular/common';
import { Component, Input} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-test-card',
  imports: [CommonModule],
  templateUrl: './test-card.html',
  styleUrl: './test-card.scss',
  standalone:true
})
export class TestCard {

  @Input() icon: string = '';
  @Input() iconClass: string = '';
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() buttonText: string = '';
  @Input() buttonClass: string = 'btn-primary';
  @Input() route: string = '';

  constructor(private router: Router) {}

  onStartTest() {
    if (this.route) {
      // Parse route and query parameters
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
      
      this.router.navigate([path], { queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined });
    } else {
      console.log(`Starting ${this.title}`);
    }
  }
}

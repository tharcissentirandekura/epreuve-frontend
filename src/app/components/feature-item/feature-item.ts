import { CommonModule } from '@angular/common';
import { Component,Input } from '@angular/core';

@Component({
  selector: 'app-feature-item',
  imports: [CommonModule],
  templateUrl: './feature-item.html',
  styleUrl: './feature-item.scss'
})
export class FeatureItem {
  @Input() icon: string = '';
  @Input() title: string = '';
  @Input() description: string = '';
}

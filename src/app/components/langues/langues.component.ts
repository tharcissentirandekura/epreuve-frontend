import { Component } from '@angular/core';
import { CourseSectionComponent } from '../../reusable/course-section/course-section.component';

@Component({
  selector: 'app-langues',
  standalone: true,
  imports: [CourseSectionComponent],
  templateUrl: './langues.component.html',
  styleUrl: './langues.component.scss'
})

export class LanguesComponent {
  constructor() {}

}



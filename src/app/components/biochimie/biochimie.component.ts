import { Component } from '@angular/core';
import { CourseSectionComponent } from '../../reusable/course-section/course-section.component';


@Component({
  selector:    'app-biochimie',
  standalone:  true,
  imports:     [CourseSectionComponent],
  templateUrl: './biochimie.component.html',
  styleUrl:    './biochimie.component.scss'
})
export class BiochimieComponent {
  

  constructor() {}

}

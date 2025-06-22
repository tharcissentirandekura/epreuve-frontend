import { Component } from '@angular/core';

import { CourseSectionComponent } from '../../reusable/course-section/course-section.component';


@Component({
  selector: 'app-mathphys',
  standalone: true,
  imports: [CourseSectionComponent],
  templateUrl: './mathphys.component.html',
  styleUrl: './mathphys.component.scss'
})

export class MathphysComponent {


  constructor() {}

  
}

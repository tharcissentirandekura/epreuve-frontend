import { Component } from '@angular/core';
import { CourseSectionComponent } from '../../reusable/course-section/course-section.component';

@Component({
  selector: 'app-concours',
  standalone: true,
  imports: [CourseSectionComponent],
  templateUrl: './concours.component.html',
  styleUrl: './concours.component.scss'
})
export class ConcoursComponent{
  constructor(){}
}



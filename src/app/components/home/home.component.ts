import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../reusable/navbar/navbar.component';
import { FooterComponent } from '../../reusable/footer/footer.component';
import { HeroComponent } from './hero/hero.component';
import { AboutComponent } from './about/about.component';
import { MissionVisionComponent } from './mission-vision/mission-vision.component';
import { CoursesComponent } from './courses/courses.component';
import { ApiService } from '../../services/api/api.service';
import { CommonModule } from '@angular/common';

declare var AOS: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NavbarComponent, 
    FooterComponent,
    HeroComponent,
    AboutComponent,
    MissionVisionComponent,
    CoursesComponent,
    CommonModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  data: any;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 100
      });
    }

    this.apiService.getDataHandler('sections',1).subscribe({
      next: (response) => {
        this.data = response;
      },
      error: (error) => {
        console.log('Error fetching data', error);
      }
    });
  }
}

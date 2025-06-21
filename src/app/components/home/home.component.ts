import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../reusable/navbar/navbar.component';
import { FooterComponent } from '../../reusable/footer/footer.component';
import { ApiService } from '../../services/api/api.service';
import { CommonModule } from '@angular/common';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, FooterComponent,CommonModule,MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  data: any;

  // Static data for courses
  courses = [
    {
      title: 'Bio-Chimie',
      icon: 'fa-flask',
      iconColor: 'text-primary',
      bgColor: 'bg-primary bg-opacity-10',
      exams: '15+',
      examsColor: 'text-primary',
      progress: 85,
      progressBar: 'bg-primary',
      description: `Préparation complète pour les examens nationaux de biologie et chimie. Accédez à des années d'examens corrigés avec solutions détaillées.`,
      link: '/biochimie',
      btnClass: 'btn-primary',
      delay: ''
    },
    {
      title: 'Langues',
      icon: 'fa-language',
      iconColor: 'text-success',
      bgColor: 'bg-success bg-opacity-10',
      exams: '12+',
      examsColor: 'text-success',
      progress: 75,
      progressBar: 'bg-success',
      description: `Maîtrisez les langues avec nos ressources complètes en français, anglais et kirundi. Examens corrigés et méthodes d'apprentissage.`,
      link: '/langues',
      btnClass: 'btn-success',
      delay: 'animate__delay-1s'
    },
    {
      title: 'Maths-Phys',
      icon: 'fa-infinity',
      iconColor: 'text-warning',
      bgColor: 'bg-warning bg-opacity-10',
      exams: '18+',
      examsColor: 'text-warning',
      progress: 90,
      progressBar: 'bg-warning',
      description: `Excellez en mathématiques et physique avec nos examens détaillés, formules essentielles et exercices pratiques corrigés.`,
      link: '/mathphys',
      btnClass: 'btn-warning',
      delay: 'animate__delay-2s'
    },
    {
      title: '9ème',
      icon: 'fa-graduation-cap',
      iconColor: 'text-info',
      bgColor: 'bg-info bg-opacity-10',
      exams: '20+',
      examsColor: 'text-info',
      progress: 95,
      progressBar: 'bg-info',
      description: `Préparez-vous au concours national de 9ème année avec nos examens types, stratégies d'examen et conseils d'experts.`,
      link: '/concours',
      btnClass: 'btn-info',
      delay: 'animate__delay-3s'
    }
  ];

  // Static data for videos (example, can be expanded)
  videos = [
    {
      title: 'Mathématiques et Physique',
      badge: 'Maths-Phys',
      badgeClass: 'bg-primary',
      icon: 'fa-infinity',
      iconColor: 'text-primary',
      src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '45 min',
      views: '1.2K vues',
      description: 'Maîtrisez les concepts fondamentaux en mathématiques et physique avec nos cours explicatifs détaillés.'
    },
    {
      title: 'Biologie et Chimie',
      badge: 'Bio-Chimie',
      badgeClass: 'bg-success',
      icon: 'fa-flask',
      iconColor: 'text-success',
      src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '38 min',
      views: '890 vues',
      description: 'Explorez le monde fascinant de la biologie et de la chimie à travers nos cours interactifs et pratiques.'
    },
    {
      title: 'Langues',
      badge: 'Langues',
      badgeClass: 'bg-warning',
      icon: 'fa-language',
      iconColor: 'text-warning',
      src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '52 min',
      views: '2.1K vues',
      description: 'Perfectionnez vos compétences linguistiques en français, anglais et kirundi avec nos méthodes éprouvées.'
    },
    {
      title: 'Concours 9ème',
      badge: '9ème',
      badgeClass: 'bg-info',
      icon: 'fa-graduation-cap',
      iconColor: 'text-info',
      src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '35 min',
      views: '1.8K vues',
      description: `Préparez-vous efficacement au concours national de 9ème année avec nos stratégies et conseils d'experts.`
    }
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getDataHandler('sections').subscribe({
      next: (response) => {
        this.data = response;
      },
      error: (error) => {
        console.log('Error fetching data', error);
      }
    });
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss'
})
export class CoursesComponent {
  // Static data for courses
  courses = [
    {
      title: 'Bio-Chimie',
      icon: 'bi-inbox',
      iconColor: 'text-primary',
      bgColor: 'bg-primary bg-opacity-10',
      cardBg: '#f5f1e8',
      exams: '15+',
      examsColor: 'text-primary',
      progress: 85,
      progressBar: 'bg-primary',
      description: `Préparation complète pour les examens nationaux de biologie et chimie. Accédez à des années d'examens corrigés avec solutions détaillées.`,
      link: '/biochimie',
      btnClass: 'btn-primary',
      students: 154,
      delay: ''
    },
    {
      title: 'Langues',
      icon: 'bi-translate',
      iconColor: 'text-success',
      bgColor: 'bg-success bg-opacity-10',
      cardBg: '#e8f5e9',
      exams: '12+',
      examsColor: 'text-success',
      progress: 75,
      progressBar: 'bg-success',
      description: `Maîtrisez les langues avec nos ressources complètes en français, anglais et kirundi. Examens corrigés et méthodes d'apprentissage.`,
      link: '/langues',
      btnClass: 'btn-success',
      students: 128,
      delay: 'animate__delay-1s'
    },
    {
      title: 'Maths-Phys',
      icon: 'bi-graph-up',
      iconColor: 'text-warning',
      bgColor: 'bg-warning bg-opacity-10',
      cardBg: '#fff3e0',
      exams: '18+',
      examsColor: 'text-warning',
      progress: 90,
      progressBar: 'bg-warning',
      description: `Excellez en mathématiques et physique avec nos examens détaillés, formules essentielles et exercices pratiques corrigés.`,
      link: '/mathphys',
      btnClass: 'btn-warning',
      students: 203,
      delay: 'animate__delay-2s'
    },
    {
      title: '9ème',
      icon: 'bi-mortarboard',
      iconColor: 'text-info',
      bgColor: 'bg-info bg-opacity-10',
      cardBg: '#e3f2fd',
      exams: '20+',
      examsColor: 'text-info',
      progress: 95,
      progressBar: 'bg-info',
      description: `Préparez-vous au concours national de 9ème année avec nos examens types, stratégies d'examen et conseils d'experts.`,
      link: '/concours',
      btnClass: 'btn-info',
      students: 187,
      delay: 'animate__delay-3s'
    }
  ];
}

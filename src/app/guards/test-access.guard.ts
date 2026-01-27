import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { IdEncoderService } from '../services/id-encoder.service';
import { ExamService } from '../services/api/exam.service';
import { ToastService } from '../services/toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class TestAccessGuard implements CanActivate {
  
  constructor(
    private idEncoder: IdEncoderService,
    private examService: ExamService,
    private router: Router,
    private toastService: ToastService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const encodedId = route.paramMap.get('id');
    
    if (!encodedId) {
      this.toastService.error('ID de test invalide.', 4000);
      this.router.navigate(['/home']);
      return of(false);
    }

    // Decode the ID
    const testId = this.idEncoder.decode(encodedId);
    
    if (!testId) {
      this.toastService.error('Lien de test invalide. Veuillez accéder au test depuis la page d\'accueil.', 4000);
      this.router.navigate(['/home']);
      return of(false);
    }

    // Validate test exists
    return this.examService.getExamContent(testId).pipe(
      map(() => true),
      catchError((error) => {
        console.error('Error validating test access:', error);
        
        if (error.status === 404) {
          this.toastService.error('Ce test n\'existe pas ou n\'est plus disponible.', 4000);
        } else {
          this.toastService.error('Impossible de charger ce test.', 4000);
        }
        
        this.router.navigate(['/home']);
        return of(false);
      })
    );
  }
}

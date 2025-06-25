import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api/api.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // Import RouterModule
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule,RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit{
  courses : number = 0;
  sections : number = 0;
  epreuves : number = 0;
  users : number = 0;
  constructor(
    private apiService:ApiService,
    private authService:AuthService,
    private router: Router,
  ){}

  ngOnInit(): void {
    const expirationDate = this.authService.getTokenExpirationDate();
    // console.log('Token expiration date:', expirationDate);
    if (expirationDate) {
      console.log('Token expires at:', expirationDate);
    }else{
      console.log('Token does not expire or invalid', expirationDate);
    }

    const isExpired = this.authService.isTokenExpired();
    if (isExpired) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }

    this.apiService.getDataHandler('sections',1).subscribe({
      next:(data) => {
        this.sections = data.length;
        this.courses = data.reduce((acc:number,section:any) => acc + section.courses.length,0);
        this.epreuves = data.reduce((acc:number,section:any) => {
          return acc + section.courses.reduce((courseAcc: number, course: any) => courseAcc + course.tests.length, 0);
        },0);
      },
      error:(err) => {
        console.error('Error fetching data in sections:', err);
      }
  });

    this.authService.getUser().subscribe({
      next: (response) => {
        this.users = response.length;
        console.log('Users successfully fetched:');
      },
      error: (err) => {

        console.error('Error fetching user data:', err.error.detail);
      },
      complete: () => {
        console.log('Completed');
      }
    });
  }


}

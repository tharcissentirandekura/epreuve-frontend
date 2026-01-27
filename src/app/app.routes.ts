import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from './guards/auth.guard';
import { TestAccessGuard } from './guards/test-access.guard';

// Eagerly loaded (core pages)
import { HomeComponent } from './components/home/home.component';
import { ContactComponent } from './components/contact/contact.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

export const routes: Routes = [
  // Core pages (eagerly loaded)
  { path: 'home', component: HomeComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Course sections (lazy loaded)
  { 
    path: 'mathphys', 
    loadComponent: () => import('./components/mathphys/mathphys.component').then(m => m.MathphysComponent)
  },
  { 
    path: 'biochimie', 
    loadComponent: () => import('./components/biochimie/biochimie.component').then(m => m.BiochimieComponent)
  },
  { 
    path: 'langues', 
    loadComponent: () => import('./components/langues/langues.component').then(m => m.LanguesComponent)
  },
  { 
    path: 'concours', 
    loadComponent: () => import('./components/concours/concours.component').then(m => m.ConcoursComponent)
  },

  // Help & Legal (lazy loaded)
  { 
    path: 'help', 
    loadComponent: () => import('./components/help-form/help-form.component').then(m => m.HelpFormComponent)
  },
  { 
    path: 'Terms', 
    loadComponent: () => import('./components/terms/terms-service/terms-service.component').then(m => m.TermsServiceComponent)
  },
  { 
    path: 'Privacy', 
    loadComponent: () => import('./components/terms/terms-service/terms-service.component').then(m => m.TermsServiceComponent)
  },

  // Protected routes (lazy loaded)
  { 
    path: 'profile', 
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'testmode/:id', 
    loadComponent: () => import('./components/test-mode-selection/test-mode-selection').then(m => m.TestModeSelection),
    canActivate: [TestAccessGuard]
  },
  { 
    path: 'timedtest/:id', 
    loadComponent: () => import('./components/timed-test/timed-test').then(m => m.TimedTest),
    canActivate: [TestAccessGuard]
  },
  { 
    path: 'test-results', 
    loadComponent: () => import('./components/test-results/test-results').then(m => m.TestResults)
  },

  // Default redirect
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

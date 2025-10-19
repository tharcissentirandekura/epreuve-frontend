import { RouterModule, Routes } from '@angular/router';
import { ContactComponent } from './components/contact/contact.component';
import { HomeComponent } from './components/home/home.component';
import { BiochimieComponent } from './components/biochimie/biochimie.component';
import { MathphysComponent } from './components/mathphys/mathphys.component';
import { LanguesComponent } from './components/langues/langues.component';
import { ConcoursComponent } from './components/concours/concours.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { RegisterComponent } from './components/register/register.component';
import { NgModule } from '@angular/core';
import { HelpFormComponent } from './components/help-form/help-form.component';
import { TermsServiceComponent } from './components/terms/terms-service/terms-service.component';
import { ExamViewerComponent } from './components/exam-viewer/exam-viewer.component';
import { AuthGuard } from './guards/auth.guard';
export const routes: Routes = [
  // { path: '',  component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'mathphys', component: MathphysComponent },
  { path: 'biochimie', component: BiochimieComponent },
  { path: 'langues', component: LanguesComponent },
  { path: 'concours', component: ConcoursComponent },
  { path: 'help', component: HelpFormComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'Terms', component: TermsServiceComponent },
  { path: 'Privacy', component: TermsServiceComponent },
  // {path: 'Terms', component: TermsServiceComponent},
  {path: 'exam/:id', component: ExamViewerComponent},
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
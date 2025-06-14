import { RouterModule,Routes } from '@angular/router';
import { ContactComponent } from './components/contact/contact.component';
import { HomeComponent } from './components/home/home.component';
import { BiochimieComponent } from './components/biochimie/biochimie.component';
import { MathphysComponent } from './components/mathphys/mathphys.component';
import { LanguesComponent } from './components/langues/langues.component';
import { ConcoursComponent } from './components/concours/concours.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { NgModule } from '@angular/core';
import { HelpFormComponent } from './components/help-form/help-form.component';
export const routes: Routes = [
  // { path: '',  component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'mathphys', component: MathphysComponent },
  { path: 'biochimie', component: BiochimieComponent },
  { path: 'langues', component: LanguesComponent },
  { path: 'concours', component: ConcoursComponent},
  { path: 'help', component: HelpFormComponent},
  { path: 'contact', component: ContactComponent },
  {path: 'dashboard',component: DashboardComponent},
  {path: 'login',component: LoginComponent},
  {path: 'signup',component: LoginComponent},
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
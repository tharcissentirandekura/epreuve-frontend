import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  CurrentYear = new Date().getFullYear();

  constructor(private router: Router) {}

  goToContact() {
    this.router.navigate(['/contact']);
  }

  goToHelp() {
    this.router.navigate(['/help']);
  }

  ngOnInit(): void {}
}
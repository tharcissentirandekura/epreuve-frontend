import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TestCard } from '../test-card/test-card';
import { FeatureItem } from '../feature-item/feature-item';
import { TestHeader } from '../test-header/test-header';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from "../../reusable/navbar/navbar.component";

@Component({
  selector: 'app-test-mode-selection',
  imports: [CommonModule, TestCard, TestHeader, NavbarComponent],
  templateUrl: './test-mode-selection.html',
  styleUrl: './test-mode-selection.scss',
  standalone:true
})
export class TestModeSelection implements OnInit{
  testId: number | null = null;
  constructor(private route:ActivatedRoute){}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.testId = id ? Number(id) : null;
    console.log('TestModeSelection - testId:', this.testId, 'from route param:', id);
  }
}
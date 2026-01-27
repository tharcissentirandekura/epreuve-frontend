import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TestCard } from '../test-card/test-card';
import { FeatureItem } from '../feature-item/feature-item';
import { TestHeader } from '../test-header/test-header';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from "../../reusable/navbar/navbar.component";
import { IdEncoderService } from '../../services/id-encoder.service';

@Component({
  selector: 'app-test-mode-selection',
  imports: [CommonModule, TestCard, TestHeader, NavbarComponent],
  templateUrl: './test-mode-selection.html',
  styleUrl: './test-mode-selection.scss',
  standalone:true
})
export class TestModeSelection implements OnInit{
  testId: number | null = null;
  constructor(
    private route: ActivatedRoute,
    private idEncoder: IdEncoderService
  ){}

  ngOnInit(): void {
    const encodedId = this.route.snapshot.paramMap.get('id');
    if (encodedId) {
      // Try to decode the ID
      const decodedId = this.idEncoder.decode(encodedId);
      if (decodedId) {
        this.testId = decodedId;
        console.log('TestModeSelection - decoded testId:', this.testId, 'from encoded:', encodedId);
      } else {
        // If decoding fails, it might be an old plain ID (for backward compatibility)
        // Try parsing as number
        const plainId = Number(encodedId);
        if (!isNaN(plainId) && plainId > 0) {
          this.testId = plainId;
          console.log('TestModeSelection - using plain testId (backward compatibility):', this.testId);
        } else {
          console.error('TestModeSelection - Invalid ID format:', encodedId);
        }
      }
    }
  }

  get encodedTestId(): string | null {
    if (!this.testId) return null;
    try {
      return this.idEncoder.encode(this.testId);
    } catch (error) {
      console.error('Error encoding test ID:', error);
      return null;
    }
  }
}
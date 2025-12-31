import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TestCard } from '../test-card/test-card';
import { TestHeader } from '../test-header/test-header';

@Component({
  selector: 'app-test-mode-selection',
  imports: [CommonModule, TestCard, TestHeader],
  templateUrl: './test-mode-selection.html',
  styleUrl: './test-mode-selection.scss',
  standalone:true
})
export class TestModeSelection {

}

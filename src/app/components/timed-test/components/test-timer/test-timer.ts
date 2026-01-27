import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './test-timer.html'
})
export class TestTimerComponent {
  timeRemaining = input.required<number>();
  isUnlimited = input<boolean>(false);

  formattedTime = computed(() => {
    const seconds = this.timeRemaining();
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  });

  isLowTime = computed(() => this.timeRemaining() < 300);
}

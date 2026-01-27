import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-test-progress',
  standalone: true,
  templateUrl: './test-progress.html'
})
export class TestProgressComponent {
  current = input.required<number>();
  total = input.required<number>();

  percentage = computed(() => {
    const t = this.total();
    return t > 0 ? ((this.current() + 1) / t) * 100 : 0;
  });
}

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimedTest } from './timed-test';

describe('TimedTest', () => {
  let component: TimedTest;
  let fixture: ComponentFixture<TimedTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimedTest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimedTest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

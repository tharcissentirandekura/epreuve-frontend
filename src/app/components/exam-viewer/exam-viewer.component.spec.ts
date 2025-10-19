import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamViewerComponent } from './exam-viewer.component';

describe('ExamViewerComponent', () => {
  let component: ExamViewerComponent;
  let fixture: ComponentFixture<ExamViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

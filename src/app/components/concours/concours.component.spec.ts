import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConcoursComponent } from './concours.component';

describe('ConcoursComponent', () => {
  let component: ConcoursComponent;
  let fixture: ComponentFixture<ConcoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConcoursComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConcoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

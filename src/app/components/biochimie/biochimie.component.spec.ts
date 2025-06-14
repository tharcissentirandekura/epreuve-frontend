import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiochimieComponent } from './biochimie.component';

describe('BiochimieComponent', () => {
  let component: BiochimieComponent;
  let fixture: ComponentFixture<BiochimieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BiochimieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BiochimieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

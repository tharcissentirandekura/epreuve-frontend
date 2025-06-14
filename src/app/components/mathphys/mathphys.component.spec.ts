import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MathphysComponent } from './mathphys.component';

describe('MathphysComponent', () => {
  let component: MathphysComponent;
  let fixture: ComponentFixture<MathphysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MathphysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MathphysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

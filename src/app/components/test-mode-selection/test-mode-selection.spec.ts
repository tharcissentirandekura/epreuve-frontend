import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestModeSelection } from './test-mode-selection';

describe('TestModeSelection', () => {
  let component: TestModeSelection;
  let fixture: ComponentFixture<TestModeSelection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModeSelection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestModeSelection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

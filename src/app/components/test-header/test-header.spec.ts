import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestHeader } from './test-header';

describe('TestHeader', () => {
  let component: TestHeader;
  let fixture: ComponentFixture<TestHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

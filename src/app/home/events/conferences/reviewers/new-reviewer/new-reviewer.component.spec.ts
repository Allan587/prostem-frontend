import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewReviewerComponent } from './new-reviewer.component';

describe('NewReviewerComponent', () => {
  let component: NewReviewerComponent;
  let fixture: ComponentFixture<NewReviewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewReviewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewReviewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

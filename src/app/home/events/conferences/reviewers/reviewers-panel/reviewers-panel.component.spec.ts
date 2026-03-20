import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewersPanelComponent } from './reviewers-panel.component';

describe('ReviewersPanelComponent', () => {
  let component: ReviewersPanelComponent;
  let fixture: ComponentFixture<ReviewersPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewersPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewersPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

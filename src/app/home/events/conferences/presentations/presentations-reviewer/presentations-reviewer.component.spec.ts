import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentationsReviewerComponent } from './presentations-reviewer.component';

describe('PresentationsReviewerComponent', () => {
  let component: PresentationsReviewerComponent;
  let fixture: ComponentFixture<PresentationsReviewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresentationsReviewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresentationsReviewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

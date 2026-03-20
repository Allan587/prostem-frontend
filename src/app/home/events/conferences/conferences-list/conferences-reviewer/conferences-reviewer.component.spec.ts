import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConferencesReviewerComponent } from './conferences-reviewer.component';

describe('ConferencesReviewerComponent', () => {
  let component: ConferencesReviewerComponent;
  let fixture: ComponentFixture<ConferencesReviewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConferencesReviewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConferencesReviewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentationsSpeakerComponent } from './presentations-speaker.component';

describe('PresentationsSpeakerComponent', () => {
  let component: PresentationsSpeakerComponent;
  let fixture: ComponentFixture<PresentationsSpeakerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresentationsSpeakerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresentationsSpeakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

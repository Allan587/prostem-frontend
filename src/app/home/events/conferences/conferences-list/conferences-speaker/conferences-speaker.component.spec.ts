import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConferencesSpeakerComponent } from './conferences-speaker.component';

describe('ConferencesSpeakerComponent', () => {
  let component: ConferencesSpeakerComponent;
  let fixture: ComponentFixture<ConferencesSpeakerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConferencesSpeakerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConferencesSpeakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

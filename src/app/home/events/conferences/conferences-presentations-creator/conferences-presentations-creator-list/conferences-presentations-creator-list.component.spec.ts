import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConferencesPresentationsCreatorListComponent } from './conferences-presentations-creator-list.component';

describe('ConferencesPresentationsCreatorListComponent', () => {
  let component: ConferencesPresentationsCreatorListComponent;
  let fixture: ComponentFixture<ConferencesPresentationsCreatorListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConferencesPresentationsCreatorListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConferencesPresentationsCreatorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

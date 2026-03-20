import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsStatisticsComponent } from './events-statistics.component';

describe('EventsStatisticsComponent', () => {
  let component: EventsStatisticsComponent;
  let fixture: ComponentFixture<EventsStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventsStatisticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventsStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

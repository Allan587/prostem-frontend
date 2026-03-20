import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersStatisticsComponent } from './users-statistics.component';

describe('UsersStatisticsComponent', () => {
  let component: UsersStatisticsComponent;
  let fixture: ComponentFixture<UsersStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersStatisticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

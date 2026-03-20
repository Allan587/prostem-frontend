import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerConferencesComponent } from './manager-conferences.component';

describe('ManagerConferencesComponent', () => {
  let component: ManagerConferencesComponent;
  let fixture: ComponentFixture<ManagerConferencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerConferencesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerConferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

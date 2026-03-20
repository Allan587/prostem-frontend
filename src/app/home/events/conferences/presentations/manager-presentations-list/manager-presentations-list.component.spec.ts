import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerPresentationsListComponent } from './manager-presentations-list.component';

describe('ManagerPresentationsListComponent', () => {
  let component: ManagerPresentationsListComponent;
  let fixture: ComponentFixture<ManagerPresentationsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerPresentationsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerPresentationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevisionFormsListComponent } from './revision-forms-list.component';

describe('RevisionFormsListComponent', () => {
  let component: RevisionFormsListComponent;
  let fixture: ComponentFixture<RevisionFormsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevisionFormsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevisionFormsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

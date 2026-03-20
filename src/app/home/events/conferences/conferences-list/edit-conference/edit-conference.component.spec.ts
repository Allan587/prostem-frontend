import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditConferenceComponent } from './edit-conference.component';

describe('EditConferenceComponent', () => {
  let component: EditConferenceComponent;
  let fixture: ComponentFixture<EditConferenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditConferenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditConferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

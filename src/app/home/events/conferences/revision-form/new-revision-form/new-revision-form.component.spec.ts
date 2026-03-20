import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRevisionFormComponent } from './new-revision-form.component';

describe('NewRevisionFormComponent', () => {
  let component: NewRevisionFormComponent;
  let fixture: ComponentFixture<NewRevisionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewRevisionFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewRevisionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

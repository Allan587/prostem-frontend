import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRevisionFormComponent } from './view-revision-form.component';

describe('ViewRevisionFormComponent', () => {
  let component: ViewRevisionFormComponent;
  let fixture: ComponentFixture<ViewRevisionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRevisionFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewRevisionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

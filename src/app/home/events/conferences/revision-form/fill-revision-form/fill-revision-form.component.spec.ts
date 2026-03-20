import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FillRevisionFormComponent } from './fill-revision-form.component';

describe('FillRevisionFormComponent', () => {
  let component: FillRevisionFormComponent;
  let fixture: ComponentFixture<FillRevisionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FillRevisionFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FillRevisionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

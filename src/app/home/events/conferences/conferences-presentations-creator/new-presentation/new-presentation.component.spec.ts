import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPresentationComponent } from './new-presentation.component';

describe('NewPresentationComponent', () => {
  let component: NewPresentationComponent;
  let fixture: ComponentFixture<NewPresentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewPresentationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewPresentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

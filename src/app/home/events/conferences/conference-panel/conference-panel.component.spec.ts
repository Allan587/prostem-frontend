import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConferencePanelComponent } from './conference-panel.component';

describe('ConferencePanelComponent', () => {
  let component: ConferencePanelComponent;
  let fixture: ComponentFixture<ConferencePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConferencePanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConferencePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

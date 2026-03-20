import { ComponentFixture, TestBed } from '@angular/core/testing';

import SignInComponent from './sign-in.component';
import { ReactiveFormsModule } from '@angular/forms';
import { GoogleButtonComponent } from '../../google-button/google-button.component';
import { AuthService } from '../../data-access/auth.service';
import { Router } from 'express';

fdescribe('SignInComponent', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  // beforeEach(async () => {
  //   await TestBed.configureTestingModule({
  //     imports: [SignInComponent]
  //   })
  //   .compileComponents();

  //   fixture = TestBed.createComponent(SignInComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['signInWithEmailAndPassword', 'signInWithGoogle']);
    const routerMock = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [SignInComponent, GoogleButtonComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignInComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertComponent } from '../../components/alert/alert.component';

function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as FormGroup;
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password && confirmPassword) {
      return password === confirmPassword ? null : { mismatch: true }
    }

    return null;
  }
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AlertComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  public minPasswordLength: number = 6;
  public signupForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(this.minPasswordLength)]],
    confirmPassword: ['', Validators.required]
  }, {
    validators: [passwordMatchValidator()]
  });

  constructor(private fb: FormBuilder, private authService: AuthService) {

  }

  public handleSubmit(): void {
    const email: string | null | undefined = this.signupForm.value.email;
    const password: string | null | undefined = this.signupForm.value.password;

    if (email && password){
      this.authService.createNewUserWithEmailAndPassword(email, password);
    }
  }
}
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  public loginForm = this.fb.group({
    email: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  public handleSubmit(): void {
    console.log(this.loginForm.value);
    if (this.loginForm.value.email && this.loginForm.value.password) {
      this.authService.logInWithEmailAndPassword(this.loginForm.value.email, this.loginForm.value.password);      
    }
  }

  public loginWithGoogle(): void {
    this.authService.signInWithGoogle();
  }
}
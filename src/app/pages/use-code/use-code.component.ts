import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CodesService } from '../../services/codes.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-use-code',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './use-code.component.html',
  styleUrl: './use-code.component.scss'
})
export class UseCodeComponent {
  public useCodeForm = this.fb.group({
    code: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private codesService: CodesService, private authService: AuthService) { }

  public handleSubmit(): void {
    console.log(this.useCodeForm.value);
    if (this.useCodeForm.value.code) {
      let p = this.codesService.checkIfCodeIsValid(this.useCodeForm.value.code);
      console.log(p);
    }
  }
}
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CodesService } from '../../services/codes.service';
import { AuthService } from '../../services/auth.service';
import { Code, CodeDb } from '../../models/code.model';
import { Timestamp } from 'firebase/firestore';

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

  public async handleSubmit(): Promise<void> {
    const formCode = this.useCodeForm.get('code');
    if (formCode && formCode.value) this.codesService.consumeCode(formCode.value);
  }
}
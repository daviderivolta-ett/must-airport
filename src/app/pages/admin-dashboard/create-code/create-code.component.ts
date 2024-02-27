import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CodesService, CreateCodeFormData } from '../../../services/codes.service';

@Component({
  selector: 'app-create-code',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-code.component.html',
  styleUrl: './create-code.component.scss'
})
export class CreateCodeComponent {
  public createCodeForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(10)]],
    app: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private codesService: CodesService) { }

  public handleSubmit(): void {
    let ref = this.codesService.parseCreateCodeFormData(this.createCodeForm.value as CreateCodeFormData);
    this.codesService.setCodeById(ref.code, ref);
    this.createCodeForm.reset();
  }
}
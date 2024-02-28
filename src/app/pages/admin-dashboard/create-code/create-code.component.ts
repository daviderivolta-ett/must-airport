import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CodesService, CreateCodeFormData } from '../../../services/codes.service';
import { DICTIONARY } from '../../../dictionaries/dictionary';

@Component({
  selector: 'app-create-code',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-code.component.html',
  styleUrl: './create-code.component.scss'
})
export class CreateCodeComponent {
  public createCodeForm = this.fb.group({
    code: ['', Validators.required],
    app: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private codesService: CodesService) { }

  public handleSubmit(): void {
    let ref = this.codesService.parseCreateCodeFormData(this.createCodeForm.value as CreateCodeFormData);
    this.codesService.setCodeById(ref.code, ref);
    this.createCodeForm.reset();
    this.generateCode();
  }

  public generateCode(): void {
    let code: string = '';
    for (let i = 1; i <= 3; i++) {
      const randomNum: number = Math.floor(Math.random() * DICTIONARY.length);
      const randomWord: string = DICTIONARY[randomNum];
      code = code + randomWord;
      if (i < 3) code = code + '-';
    }
    if (!this.codesService.codes.find(item => item.code === code)) {
      this.createCodeForm.get('code')?.setValue(code);
    } else {
      this.generateCode();
    }
  }

  public ngOnInit(): void {
    this.generateCode();
  }
}
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
    console.log(this.useCodeForm.value);
    if (this.useCodeForm.value.code) {
      let isCodeValid = this.codesService.checkIfCodeIsValid(this.useCodeForm.value.code);
      let code: Code;
      if (isCodeValid) {
        let codeDb: CodeDb = await this.codesService.getCodeByCode(this.useCodeForm.value.code);
        codeDb.usedOn = Timestamp.now();
        if (this.authService.loggedUser) codeDb.userId = this.authService.loggedUser.id;
        codeDb.isValid = false;
        this.codesService.setCodeById(codeDb.code, codeDb);
      }
    }
  }
}
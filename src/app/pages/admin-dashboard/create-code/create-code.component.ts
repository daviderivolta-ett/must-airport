import { Component, Input, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CodesService, CreateCodeFormData } from '../../../services/codes.service';
import { DICTIONARY } from '../../../dictionaries/dictionary';
import { NgClass } from '@angular/common';
import { CreateCodeDialogService } from '../../../observables/create-code-dialog.service';
import { ClickOutsideDirective } from '../../../directives/click-outside.directive';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SnackbarService } from '../../../observables/snackbar.service';
import { SNACKBAROUTCOME, SNACKBARTYPE } from '../../../models/snackbar.model';

@Component({
  selector: 'app-create-code',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule, ClickOutsideDirective],
  templateUrl: './create-code.component.html',
  styleUrl: './create-code.component.scss',
  animations: [
    trigger('openClose', [
      state('open', style({
        display: 'block',
        visibility: 'visible',
        transform: 'scale(1)',
        transformOrigin: 'bottom right'
      })),
      state('closed', style({
        display: 'none',
        visibility: 'hidden',
        transform: 'scale(0)',
        transformOrigin: 'bottom right'
      })),
      transition('closed => open', [
        animate('0.25s cubic-bezier(.47,1.64,.41,.8)')
      ]),
      transition('open => closed', [
        animate('0.1s')
      ])
    ])
  ]
})
export class CreateCodeComponent {
  public isOpen: boolean = false;
  public createCodeForm = this.fb.group({
    code: ['', Validators.required],
    app: ['', Validators.required],
    type: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private codesService: CodesService, private createCodeDialogService: CreateCodeDialogService, private snackbarService: SnackbarService) {
    effect(() => this.isOpen = this.createCodeDialogService.isOpenSignal());
  }

  public handleSubmit(): void {
    let ref = this.codesService.parseCreateCodeFormData(this.createCodeForm.value as CreateCodeFormData);
    this.codesService.setCodeById(ref.code, ref);
    this.createCodeForm.reset({ app: '', type: '' });
    this.createCodeDialogService.isOpenSignal.set(false);
    this.generateCode();
    this.snackbarService.createSnackbar('Codice creato con successo.', SNACKBARTYPE.Closable, SNACKBAROUTCOME.Success);
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

  public closeDialog(): void {
    this.createCodeDialogService.isOpenSignal.set(false);
  }

  public ngOnInit(): void {
    this.generateCode();
  }
}
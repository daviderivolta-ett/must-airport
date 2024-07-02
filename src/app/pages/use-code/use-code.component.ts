import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CodesService } from '../../services/codes.service';
import { AuthService } from '../../services/auth.service';
import { SnackbarService } from '../../observables/snackbar.service';
import { SNACKBAROUTCOME, SNACKBARTYPE } from '../../models/snackbar.model';
import { Timestamp } from 'firebase/firestore';
import { APPTYPE } from '../../models/app-type.mode';
import { LoggedUser, USERLEVEL, UserData } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { AuthCode } from '../../models/auth-code.model';

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

  constructor(
    private fb: FormBuilder,
    private codesService: CodesService,
    private authService: AuthService,
    private userService: UserService,
    private snackbarService: SnackbarService
  ) { }

  public async handleSubmit(): Promise<void> {
    const formCode = this.useCodeForm.get('code');
    if (formCode && formCode.value && this.authService.loggedUser) this.consumeCode(formCode.value);
    this.useCodeForm.reset();
  }

  public async pasteFromClipboard(): Promise<void> {
    const clipboardText: string = await navigator.clipboard.readText();
    this.useCodeForm.setValue({ code: clipboardText });
  }

  private async consumeCode(code: string): Promise<void> {
    if (!this.authService.loggedUser) return;
    const loggedUser: LoggedUser = this.authService.loggedUser;

    const foundCode: AuthCode | null = this.codesService.checkIfCodeExists(code);
    if (!foundCode) {
      this.snackbarService.createSnackbar('Il codice inserito non è valido.', SNACKBARTYPE.Closable, SNACKBAROUTCOME.Error);
      return;
    }

    if (loggedUser.level === USERLEVEL.Superuser || foundCode.user === loggedUser.id || loggedUser.apps.find(app => app === foundCode.vertId)) {
      this.snackbarService.createSnackbar(`Sei già abilitato per l\'app ${foundCode.vertId}.`, SNACKBARTYPE.Closable, SNACKBAROUTCOME.Error);
      return;
    }

    const isWebValid: boolean = this.codesService.checkIfCodeIsWebValid(foundCode);
    if (!isWebValid) {
      this.snackbarService.createSnackbar('Il codice inserito non è valido.', SNACKBARTYPE.Closable, SNACKBAROUTCOME.Error);
      return;
    }

    const isAlreadyAssociated: boolean = this.codesService.checkIfCodesIsAlreadyAssociated(foundCode);
    if (isAlreadyAssociated) {
      this.snackbarService.createSnackbar('Il codice inserito è già stato usato.', SNACKBARTYPE.Closable, SNACKBAROUTCOME.Error);
      return;
    }

    let authCode: AuthCode = await this.codesService.getCodeByCode(code);
    authCode.associatedOn = new Date();
    authCode.user = loggedUser.id;
    loggedUser.apps.push(authCode.vertId);

    let userData: UserData = {
      userLevel: USERLEVEL.Admin,
      lastLogin: Timestamp.fromDate(loggedUser.lastLogin),
      lastApp: loggedUser.lastApp
    }  

    this.codesService.setAuthCodeById(authCode.code, authCode, APPTYPE.Web);
    this.authService.loggedUser.level = USERLEVEL.Admin;
    await this.userService.setUserDataById(loggedUser.id, userData);
    this.snackbarService.createSnackbar(`Sei ora abilitato per l\'app ${authCode.vertId}.`, SNACKBARTYPE.Closable, SNACKBAROUTCOME.Success);
  }
}
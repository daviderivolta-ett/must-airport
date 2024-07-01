import { Component, Input } from '@angular/core';
import { AuthCode } from '../../../models/auth-code.model';
import { NgClass, NgStyle, TitleCasePipe } from '@angular/common';
import { VerticalNamePipe } from '../../../pipes/vertical-name.pipe';
import { TooltipDirective } from '../../../directives/tooltip.directive';
import { CodesService } from '../../../services/codes.service';
import { SnackbarService } from '../../../observables/snackbar.service';
import { SNACKBAROUTCOME, SNACKBARTYPE } from '../../../models/snackbar.model';

@Component({
  selector: 'app-auth-code',
  standalone: true,
  imports: [NgClass, NgStyle, TitleCasePipe, VerticalNamePipe, TooltipDirective],
  templateUrl: './auth-code.component.html',
  styleUrl: './auth-code.component.scss'
})
export class AuthCodeComponent {
  @Input() public code: AuthCode = AuthCode.createEmpty();

  constructor(
    private codesService: CodesService,
    private snackbarService: SnackbarService
  ) { }

  public copyToClipboard(): void {
    if (!this.code) return;
    navigator.clipboard.writeText(this.code.code);
  }

  public toggleCode(): void {
    if (this.code.code.length === 0) return;
    this.code.isValid = !this.code.isValid;

    try {
      this.codesService.setAuthCodeById(this.code.code, this.code, this.code.appType);
      this.snackbarService.createSnackbar('Permessi aggiornati con successo.', SNACKBARTYPE.Closable, SNACKBAROUTCOME.Success);
    } catch (error) {
      this.snackbarService.createSnackbar('Errore nell\'aggiornamento dei permessi. Riprovare.', SNACKBARTYPE.Closable, SNACKBAROUTCOME.Error);
    }
  }
}
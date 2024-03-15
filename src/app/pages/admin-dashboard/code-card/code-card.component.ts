import { Component, Input } from '@angular/core';
import { Code, CodeDb } from '../../../models/code.model';
import { NgClass, TitleCasePipe } from '@angular/common';
import { TooltipDirective } from '../../../directives/tooltip.directive';
import { CodesService } from '../../../services/codes.service';
import { SnackbarService } from '../../../observables/snackbar.service';
import { SNACKBAROUTCOME, SNACKBARTYPE } from '../../../models/snackbar.model';

@Component({
  selector: 'app-code-card',
  standalone: true,
  imports: [NgClass, TitleCasePipe, TooltipDirective],
  templateUrl: './code-card.component.html',
  styleUrl: './code-card.component.scss'
})
export class CodeCardComponent {
  @Input() public code: Code | null = null;

  constructor(private codesService: CodesService, private snackbarService: SnackbarService) { }

  public copyToClipboard(): void {
    if (!this.code) return;
    navigator.clipboard.writeText(this.code.code);
  }

  public disableCode(): void {
    if (!this.code) return;
    let codeDb: CodeDb = this.codesService.parseCode(this.code);
    codeDb.isValid = !codeDb.isValid;
    try {
      this.codesService.setCodeById(this.code.appType, codeDb.code, codeDb);
      this.snackbarService.createSnackbar('Permessi aggiornati con successo.', SNACKBARTYPE.Closable, SNACKBAROUTCOME.Success);
    } catch (error) {
      this.snackbarService.createSnackbar('Errore nell\'aggiornamento dei permessi. Riprovare.', SNACKBARTYPE.Closable, SNACKBAROUTCOME.Error);
    }
  }
}
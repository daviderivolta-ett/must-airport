import { Component } from '@angular/core';
import { OperationCardBaseComponent } from '../../../components/operation-card-base/operation-card-base.component';
import { ReportsService } from '../../../services/reports.service';
import { OperationLinkDb } from '../../../models/operation.model';
import { OperationsService } from '../../../services/operations.service';
import { SnackbarService } from '../../../observables/snackbar.service';
import { SNACKBAROUTCOME, SNACKBARTYPE } from '../../../models/snackbar.model';
import { DatePipe } from '@angular/common';
import { TooltipDirective } from '../../../directives/tooltip.directive';
import { LabelPipe } from '../../../pipes/label.pipe';
import { SentenceCasePipe } from '../../../pipes/sentence-case.pipe';

@Component({
  selector: 'app-operation-card-management',
  standalone: true,
  imports: [DatePipe, LabelPipe, SentenceCasePipe, TooltipDirective],
  templateUrl: './operation-card-management.component.html',
  styleUrl: './operation-card-management.component.scss'
})
export class OperationCardManagementComponent extends OperationCardBaseComponent {
  constructor(reportsService: ReportsService, private operationsService: OperationsService, private snackbarService: SnackbarService) {
    super(reportsService);
  }

  public copyToClipboard(): void {
    navigator.clipboard.writeText(`https://app.s4must.it/appLink?id=${this.operation?.linkId}`);
  }

  public async deleteOperation(): Promise<void> {
    if (!this.operation) return;
    if (!this.report) return;

    let msg: string;

    try {
      switch (this.operation.type) {
        case 'maintenance':
          msg = 'Intervento eliminato con successo.';
          break;

        default:
          msg = 'Ispezione eliminata con successo.';
          break;
      }

      await this.operationsService.deleteInspectionById(this.operation.id);
      await this.operationsService.deleteOperationLinkById(this.operation.linkId);
      await this.reportsService.removeOperationByReportId(this.report.id, this.operation.id);
      this.snackbarService.createSnackbar(msg, SNACKBARTYPE.Closable);

    } catch (error) {
      msg = 'Si è verificato un errore. Riprovare.'
      this.snackbarService.createSnackbar(msg, SNACKBARTYPE.Closable, SNACKBAROUTCOME.Error);
    }
  }
}

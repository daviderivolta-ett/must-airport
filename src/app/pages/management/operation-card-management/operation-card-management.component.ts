import { Component } from '@angular/core';
import { OperationCardBaseComponent } from '../../../components/operation-card-base/operation-card-base.component';
import { ReportsService } from '../../../services/reports.service';
import { OperationLinkDb } from '../../../models/operation.model';
import { OperationsService } from '../../../services/operations.service';
import { SnackbarService } from '../../../observables/snackbar.service';
import { SNACKBAROUTCOME, SNACKBARTYPE } from '../../../models/snackbar.model';
import { DatePipe } from '@angular/common';
import { TooltipDirective } from '../../../directives/tooltip.directive';

@Component({
  selector: 'app-operation-card-management',
  standalone: true,
  imports: [DatePipe, TooltipDirective],
  templateUrl: './operation-card-management.component.html',
  styleUrl: './operation-card-management.component.scss'
})
export class OperationCardManagementComponent extends OperationCardBaseComponent {
  constructor(reportsService: ReportsService, private operationsService: OperationsService, private snackbarService: SnackbarService) {
    super(reportsService);
  }

  public copyToClipboard(): void {
    navigator.clipboard.writeText(`https://s4must.it/appLink?id=${this.operation?.operationLink}`);
  }

  public async deleteOperation(): Promise<void> {
    if (!this.operation) return;

    const operationLink: OperationLinkDb = await this.operationsService.getOperationById(this.operation.operationLink);

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

      await this.reportsService.deleteOperationByReportId(operationLink.reportParentId, this.operation);
      await this.operationsService.deleteOperationLinkById(this.operation.operationLink)
      this.snackbarService.createSnackbar(msg, SNACKBARTYPE.Closable);

    } catch (error) {
      msg = 'Si è verificato un errore. Riprovare.'
      this.snackbarService.createSnackbar(msg, SNACKBARTYPE.Closable, SNACKBAROUTCOME.Error);
    }
  }
}

import { Component, Input } from '@angular/core';
import { OPERATIONTYPE, Operation, OperationLinkDb } from '../../../models/operation.model';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { ReportsService } from '../../../services/reports.service';
import { SnackbarService } from '../../../observables/snackbar.service';
import { SNACKBAROUTCOME, SNACKBARTYPE } from '../../../models/snackbar.model';
import { TooltipDirective } from '../../../directives/tooltip.directive';
import { OperationsService } from '../../../services/operations.service';

@Component({
  selector: 'app-operation-card',
  standalone: true,
  imports: [DatePipe, TitleCasePipe, TooltipDirective],
  templateUrl: './operation-card.component.html',
  styleUrl: './operation-card.component.scss'
})
export class OperationCardComponent {
  @Input() public operation: Operation = Operation.createEmpty();

  constructor(private reportsService: ReportsService, private operationsService: OperationsService, private snackbarService: SnackbarService) { }

  public copyToClipboard(): void {
    navigator.clipboard.writeText(`https://app.s4must.it/appLink?id=${this.operation.operationLink}`);
  }

  public async deleteOperation(): Promise<void> {
    const operation: OperationLinkDb = await this.operationsService.getOperationById(this.operation.operationLink);

    let msg: string;
    try {
      switch (this.operation.type) {
        case OPERATIONTYPE.Maintenance:
          msg = 'Intervento eliminato con successo.';
          break;
        case OPERATIONTYPE.InspectionHorizontal:
          msg = 'Ispezione eliminata con successo.';
          break;
        case OPERATIONTYPE.InspectionVertical:
          msg = 'Ispezione eliminata con successo.';
          break;
        default:
          msg = 'Ispezione eliminata con successo.';
          break;
      }

      await this.reportsService.deleteOperationByReportId(operation.reportParentId, this.operation);
      await this.operationsService.deleteOperationLinkById(this.operation.operationLink);
      this.snackbarService.createSnackbar(msg, SNACKBARTYPE.Closable, SNACKBAROUTCOME.Success);

    } catch (error) {
      msg = 'Si è verificato un errore. Riprovare.'
      this.snackbarService.createSnackbar(msg, SNACKBARTYPE.Closable, SNACKBAROUTCOME.Error);
    }
  }
}
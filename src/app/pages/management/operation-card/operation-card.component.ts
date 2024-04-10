import { Component, Input } from '@angular/core';
import { Operation } from '../../../models/operation.model';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { ReportsService } from '../../../services/reports.service';
import { ReportParent } from '../../../models/report-parent.model';
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
  @Input() public parentReport: ReportParent = ReportParent.createEmpty();

  constructor(private reportsService: ReportsService, private operationsService: OperationsService, private snackbarService: SnackbarService) { }

  public copyToClipboard(): void {
    navigator.clipboard.writeText(`https://s4must.it/appLink?id=${this.operation.operationLink}`);
  }

  public async deleteOperation(): Promise<void> {
    let msg: string;
    try {
      switch (this.operation.type) {
        case 'maintenance':
          msg = 'Intervento eliminato con successo.';
          break;
        case 'inspection':
          msg = 'Ispezione eliminata con successo.';
          break;
        default:
          msg = 'Ispezione eliminata con successo.';
          break;
      }
      
      await this.reportsService.deleteOperationByReportId(this.parentReport.id, this.operation);
      await this.operationsService.deleteOperationLinkById(this.operation.operationLink);
      this.snackbarService.createSnackbar(msg, SNACKBARTYPE.Closable, SNACKBAROUTCOME.Success);

    } catch (error) {
      msg = 'Si è verificato un errore. Riprovare.'
      this.snackbarService.createSnackbar(msg, SNACKBARTYPE.Closable, SNACKBAROUTCOME.Error);
    }
  }
}
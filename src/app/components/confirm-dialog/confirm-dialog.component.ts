import { Component, ElementRef, Input } from '@angular/core';
import { ReportChild } from '../../models/report-child.model';
import { ConfirmDialogService } from '../../observables/confirm-dialog.service';
import { ReportsService } from '../../services/reports.service';
import { DatePipe } from '@angular/common';
import { SnackbarService } from '../../observables/snackbar.service';
import { SNACKBAROUTCOME, SNACKBARTYPE } from '../../models/snackbar.model';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  public host: HTMLElement | null = document.querySelector('#confirm-dialog');
  public childReport: ReportChild = ReportChild.createEmpty();

  constructor(private el: ElementRef, private confirmDialogService: ConfirmDialogService, private reportsService: ReportsService, private snackbarService: SnackbarService) {
    this.childReport = this.confirmDialogService.childReport;
  }

  public async confirm(): Promise<void> {
    let msg: string;
    try {      
      await this.reportsService.deleteChildReportBydId(this.childReport.id);
      msg = 'Aggiornamento eliminato con successo';
    } catch (error) {
      msg = 'Si è verificato un problema con l\'eliminazione dell\'aggiornamento. Riprovare.';
      this.snackbarService.createSnackbar(msg, SNACKBARTYPE.Closable, SNACKBAROUTCOME.Error);
    }
    this.close();
  }

  public cancel(): void {
    this.close();
  }

  public close(): void {
    this.host?.remove();
  }
}
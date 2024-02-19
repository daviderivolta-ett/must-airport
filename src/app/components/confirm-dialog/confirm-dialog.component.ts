import { Component, ElementRef, Input } from '@angular/core';
import { ReportChild } from '../../models/report-child.model';
import { ConfirmDialogService } from '../../observables/confirm-dialog.service';
import { ReportsService } from '../../services/reports.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  public host: HTMLElement | null = document.querySelector('#confirm-dialog');
  public childReport: ReportChild = ReportChild.createEmpty();

  constructor(private el: ElementRef, private confirmDialogService: ConfirmDialogService, private reportsService: ReportsService) {
    this.childReport = this.confirmDialogService.childReport;
  }

  public async confirm(): Promise<void> {
    await this.reportsService.deleteChildReportBydId(this.childReport.id);
    this.close();
  }

  public cancel(): void {
    this.close();
  }

  public close(): void {
    this.host?.remove();
  }
}
import { Component, effect } from '@angular/core';
import { DialogService } from '../../../observables/dialog.service';
import { ReportParent } from '../../../models/report-parent.model';
import { ReportChild } from '../../../models/report-child.model';
import { ReportsService } from '../../../services/reports.service';
import { DatePipe, NgClass } from '@angular/common';
import { DialogCardComponent } from '../dialog-card/dialog-card.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [DialogCardComponent, DatePipe, NgClass, RouterLink],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {
  public isOpen: boolean = false;
  public parentReport: ReportParent = ReportParent.createEmpty();
  public childrenReport: ReportChild[] = [];

  constructor(private dialogService: DialogService, private reportsService: ReportsService) {
    effect(() => {
      this.isOpen = this.dialogService.isOpen();
    });

    effect(async () => {
      this.parentReport = this.dialogService.report();
      this.childrenReport = await this.reportsService.populateChildrenReports(this.parentReport.childrenIds);
      this.childrenReport.map((report: ReportChild) => {       
        if (report.tagFailure != undefined) report = this.reportsService.populateFailureTags(report);
        if (report.subTagFailure != undefined) report = this.reportsService.populateFailureSubtags(report);
      });
      console.log(this.childrenReport);
    });
  }

  closeDialog(): void {
    this.dialogService.isOpen.set(false);
    this.parentReport = ReportParent.createEmpty();
    this.childrenReport = [];
  }
}
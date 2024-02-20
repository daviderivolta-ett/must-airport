import { Component, effect } from '@angular/core';
import { DialogService } from '../../../observables/dialog.service';
import { ReportParent } from '../../../models/report-parent.model';
import { ReportChild } from '../../../models/report-child.model';
import { ReportsService } from '../../../services/reports.service';
import { DatePipe, NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ChildReportCardComponent } from '../../../components/child-report-card/child-report-card.component';
import { CloseEscapeDirective } from '../../../directives/close-escape.directive';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [ChildReportCardComponent, DatePipe, NgClass, RouterLink, CloseEscapeDirective],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {
  public isOpen: boolean = false;
  public parentReport: ReportParent = ReportParent.createEmpty();
  public childrenReport: ReportChild[] = [];

  constructor(private dialogService: DialogService, private reportsService: ReportsService, private router: Router) {
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
      // console.log(this.parentReport);
      // console.log(this.childrenReport);
    });
  }

  public closeDialog(): void {
    this.dialogService.isOpen.set(false);
    this.parentReport = ReportParent.createEmpty();
    this.childrenReport = [];
  }

  public navigateTo(id: string): void {
    this.router.navigate(['/gestione', id]);
    this.closeDialog();
  }
}
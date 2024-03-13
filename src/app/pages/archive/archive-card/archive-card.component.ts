import { Component, Input, effect } from '@angular/core';
import { ReportParent } from '../../../models/report-parent.model';
import { DatePipe, NgClass } from '@angular/common';
import { ReportChild } from '../../../models/report-child.model';
import { ReportsService } from '../../../services/reports.service';
import { FailureSubTag } from '../../../models/failure-subtag.model';
import { FailureTag } from '../../../models/failure-tag.model';
import { HoverTooltipDirective } from '../../../directives/hover-tooltip.directive';

@Component({
  selector: 'app-archive-card',
  standalone: true,
  imports: [DatePipe, NgClass, HoverTooltipDirective],
  templateUrl: './archive-card.component.html',
  styleUrl: './archive-card.component.scss'
})
export class ArchiveCardComponent {
  public childrenReport: ReportChild[] = [];
  @Input() public parentReport: ReportParent = ReportParent.createEmpty();
  @Input() public set _parentReport(value: ReportParent) {
    this.loadChildrenReports(value.childrenIds)
      .then(() => {
        this.childrenReport.map((report: ReportChild) => {
          if (report.fields.tagFailure) report = this.reportsService.populateFailureTags(report);
          if (report.fields.subTagFailure) report = this.reportsService.populateFailureSubtags(report);
        })
        this.discardDuplicatedReportFailureTags(this.childrenReport);
        this.discardDuplicatedReportFailureSubTags(this.childrenReport);
        this.parentReport = value;
      })
  }
  public failureTags: FailureTag[] = [];
  public failureSubTags: FailureSubTag[] = [];

  constructor(private reportsService: ReportsService) { }

  private async loadChildrenReports(childrenIds: string[]): Promise<void> {
    this.childrenReport = await this.reportsService.populateChildrenReports(childrenIds);
  }

  private discardDuplicatedReportFailureTags(childrenReport: ReportChild[]): void {
    let reportFailureTags: FailureTag[] = [];
    childrenReport.forEach((childReport: ReportChild) => {
      if (!childReport.fields.tagFailure || childReport.fields.tagFailure.length === 0) return;
      childReport.fields.tagFailure.forEach((failureTag: FailureTag | string) => {
        if (typeof failureTag === 'string') return;
        reportFailureTags.push(failureTag);
      });
    });
    let uniqueReportFailureTags: FailureTag[] = [];
    let uniqueIds: string[] = [];
    reportFailureTags.forEach(tag => {
      if (uniqueIds.indexOf(tag.id) === -1) {
        uniqueIds.push(tag.id);
        uniqueReportFailureTags.push(tag);
      }
    });
    this.failureTags = [...uniqueReportFailureTags];
  }

  private discardDuplicatedReportFailureSubTags(childrenReport: ReportChild[]): void {
    let reportFailureSubTags: FailureSubTag[] = [];
    childrenReport.forEach((childReport: ReportChild) => {
      if (!childReport.fields.subTagFailure || childReport.fields.subTagFailure.length === 0) return;
      childReport.fields.subTagFailure.forEach((failureSubTag: FailureSubTag | string) => {
        if (typeof failureSubTag === 'string') return;
        reportFailureSubTags.push(failureSubTag);
      });
    });
    let uniqueReportFailureSubTags: FailureSubTag[] = [];
    let uniqueIds: string[] = [];
    reportFailureSubTags.forEach(tag => {
      if (uniqueIds.indexOf(tag.id) === -1) {
        uniqueIds.push(tag.id);
        uniqueReportFailureSubTags.push(tag);
      }
    });
    this.failureSubTags = [...uniqueReportFailureSubTags];
  }
}
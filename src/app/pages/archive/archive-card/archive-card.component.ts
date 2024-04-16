import { Component, Input } from '@angular/core';
import { ReportParent } from '../../../models/report-parent.model';
import { DatePipe, NgClass } from '@angular/common';
import { ReportChild } from '../../../models/report-child.model';
import { ReportParentClosingDataDb, ReportsService } from '../../../services/reports.service';
import { HoverTooltipDirective } from '../../../directives/hover-tooltip.directive';
import { Router } from '@angular/router';
import { Tag } from '../../../models/tag.model';

@Component({
  selector: 'app-archive-card',
  standalone: true,
  imports: [DatePipe, NgClass, HoverTooltipDirective],
  templateUrl: './archive-card.component.html',
  styleUrl: './archive-card.component.scss'
})
export class ArchiveCardComponent {
  private _parentReport: ReportParent = ReportParent.createEmpty();

  public get parentReport(): ReportParent {
    return this._parentReport;
  }

  @Input() public set parentReport(value: ReportParent) {
    const childrenReport: Promise<ReportChild>[] = value.childrenIds.map(async (id: string) => {
      return await this.reportsService.getChildReportById(id);
    });

    Promise.all(childrenReport).then((reports: ReportChild[]) => {
      reports.map((report: ReportChild) => {
        if (report.fields.childFlowTags1) report = this.reportsService.populateChildFlowTags1(report);
        if (report.fields.childFlowTags2) report = this.reportsService.populateChildFlowTags2(report);
      });
      this.discardDuplicatedReportFailureTags(reports);
      this.discardDuplicatedReportFailureSubTags(reports);
      this.childrenReport = reports;

    });
    this._parentReport = value;
  }

  public childrenReport: ReportChild[] = [];
  public childFlowTags1: Tag[] = [];
  public childFlowTags2: Tag[] = [];

  constructor(private reportsService: ReportsService, private router: Router) { }

  public async restoreReport(): Promise<void> {
    let data: ReportParentClosingDataDb = {
      archived: false,
      archivingTime: null
    }

    await this.reportsService.setReportById(this.parentReport.id, data);
  }

  public navigateTo(id: string): void {
    this.router.navigate(['/archivio', id]);
  }

  private getStringTags(tags: Tag[]): string[] {
    let strings: string[] = [];
    tags.forEach((tag: Tag) => strings.push(tag.name));
    return strings;
  }

  private discardDuplicatedReportFailureTags(childrenReport: ReportChild[]): void {
    let reportFailureTags: Tag[] = [];
    childrenReport.forEach((childReport: ReportChild) => {
      if (!childReport.fields.childFlowTags1 || childReport.fields.childFlowTags1.length === 0) return;
      childReport.fields.childFlowTags1.forEach((failureTag: Tag | string) => {
        if (typeof failureTag === 'string') return;
        reportFailureTags.push(failureTag);
      });
    });
    let uniqueReportFailureTags: Tag[] = [];
    let uniqueIds: string[] = [];
    reportFailureTags.forEach(tag => {
      if (uniqueIds.indexOf(tag.id) === -1) {
        uniqueIds.push(tag.id);
        uniqueReportFailureTags.push(tag);
      }
    });
    this.childFlowTags1 = [...uniqueReportFailureTags];
  }

  private discardDuplicatedReportFailureSubTags(childrenReport: ReportChild[]): void {
    let reportFailureSubTags: Tag[] = [];
    childrenReport.forEach((childReport: ReportChild) => {
      if (!childReport.fields.childFlowTags2 || childReport.fields.childFlowTags2.length === 0) return;
      childReport.fields.childFlowTags2.forEach((failureSubTag: Tag | string) => {
        if (typeof failureSubTag === 'string') return;
        reportFailureSubTags.push(failureSubTag);
      });
    });
    let uniqueReportFailureSubTags: Tag[] = [];
    let uniqueIds: string[] = [];
    reportFailureSubTags.forEach(tag => {
      if (uniqueIds.indexOf(tag.id) === -1) {
        uniqueIds.push(tag.id);
        uniqueReportFailureSubTags.push(tag);
      }
    });
    this.childFlowTags2 = [...uniqueReportFailureSubTags];
  }
}
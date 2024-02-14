import { Component, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportParent } from '../../../models/report-parent.model';
import { ReportChild } from '../../../models/report-child.model';
import { TechElementTag } from '../../../models/tech-element-tag.model';
import { DictionaryService } from '../../../services/dictionary.service';
import { ValidationFormComponent } from '../validation-form/validation-form.component';
import { ReportsService } from '../../../services/reports.service';
import { FailureTag } from '../../../models/failure-tag.model';
import { DatePipe, NgClass } from '@angular/common';
import { FailureSubTag } from '../../../models/failure-subtag.model';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [ValidationFormComponent, DatePipe, NgClass],
  templateUrl: './management.component.html',
  styleUrl: './management.component.scss'
})
export class ManagementComponent {
  public id: string | null = null;
  public parentReport: ReportParent = ReportParent.createEmpty();
  public childrenReport: ReportChild[] = [];
  public techElementTags: TechElementTag[] = [];
  public failureTags: FailureTag[] = [];
  public reportFailureTags: FailureTag[] = [];
  public reportFailureSubTags: FailureSubTag[] = [];

  constructor(private route: ActivatedRoute, private dictionaryService: DictionaryService, private reportsService: ReportsService) {
    effect(async () => {
      this.parentReport = this.reportsService.selectedReportSignal();
      this.childrenReport = await this.reportsService.populateChildrenReports(this.parentReport.childrenIds);
      this.childrenReport.map((report: ReportChild) => {
        if (report.tagFailure != undefined) report = this.reportsService.populateFailureTags(report);
        if (report.subTagFailure != undefined) report = this.reportsService.populateFailureSubtags(report);
      });
      console.log(this.parentReport);
      // console.log(this.childrenReport);

      this.discardDuplicatedReportFailureTags(this.childrenReport);
      this.discardDuplicatedReportFailureSubTags(this.childrenReport);
    });
    effect(() => this.techElementTags = this.dictionaryService.techElementTagsSignal());
    effect(() => this.failureTags = this.dictionaryService.failureTagsSignal());
  }

  async ngOnInit(): Promise<void> {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.reportsService.selectReport(this.id);
    }
  }

  private discardDuplicatedReportFailureTags(childrenReport: ReportChild[]): void {
    let reportFailureTags: FailureTag[] = [];
    childrenReport.forEach((childReport: ReportChild) => {
      if (!childReport.tagFailure || childReport.tagFailure.length === 0) return;
      childReport.tagFailure.forEach((failureTag: FailureTag | string) => {
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
    this.reportFailureTags = [...uniqueReportFailureTags];  
  }

  private discardDuplicatedReportFailureSubTags(childrenReport: ReportChild[]): void {
    let reportFailureSubTags: FailureSubTag[] = [];
    childrenReport.forEach((childReport: ReportChild) => {
      if (!childReport.subTagFailure || childReport.subTagFailure.length === 0) return;
      childReport.subTagFailure.forEach((failureSubTag: FailureSubTag | string) => {
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
    this.reportFailureSubTags = [...uniqueReportFailureSubTags];    
  }
}

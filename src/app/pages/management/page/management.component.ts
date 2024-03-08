import { Component, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportParent } from '../../../models/report-parent.model';
import { ReportChild } from '../../../models/report-child.model';
import { TechElementTag } from '../../../models/tech-element-tag.model';
import { DictionaryService } from '../../../services/dictionary.service';
import { ValidationFormComponent } from '../validation-form/validation-form.component';
import { ReportsService } from '../../../services/reports.service';
import { FailureTag } from '../../../models/failure-tag.model';
import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { FailureSubTag } from '../../../models/failure-subtag.model';
import { ChildReportCardComponent } from '../../../components/child-report-card/child-report-card.component';
import { InspectionFormComponent } from '../inspection-form/inspection-form.component';
import { OperationCardComponent } from '../operation-card/operation-card.component';
import { MiniMapComponent } from '../../../components/mini-map/mini-map.component';
import { MiniMapData } from '../../../services/map.service';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [MiniMapComponent, ChildReportCardComponent, ValidationFormComponent, InspectionFormComponent, OperationCardComponent, DatePipe, NgClass, TitleCasePipe],
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
  // public miniMapData: MiniMapData = { location: new GeoPoint(0.0, 0.0), priority: PRIORITY.NotAssigned }
  public miniMapData!: MiniMapData;

  constructor(private route: ActivatedRoute, private dictionaryService: DictionaryService, private reportsService: ReportsService) {
    effect(async () => {
      this.parentReport = this.reportsService.selectedReportSignal();
      this.childrenReport = await this.reportsService.populateChildrenReports(this.parentReport.childrenIds);
      this.childrenReport.map((report: ReportChild) => {
        if (report.fields.tagFailure != undefined) report = this.reportsService.populateFailureTags(report);
        if (report.fields.subTagFailure != undefined) report = this.reportsService.populateFailureSubtags(report);
      });
      this.miniMapData = { location: this.parentReport.location, priority: this.parentReport.priority };
      // console.log(this.parentReport);
      console.log(this.childrenReport);

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
    this.reportFailureTags = [...uniqueReportFailureTags];
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
    this.reportFailureSubTags = [...uniqueReportFailureSubTags];
  }
}

import { ApplicationRef, Component, ViewChild, createComponent, effect } from '@angular/core';
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
import { ArchiveDialogComponent } from '../../../components/archive-dialog/archive-dialog.component';
import { ArchiveDialogService } from '../../../observables/archive-dialog.service';
import { Tag } from '../../../models/tag.model';
import { ConfigService } from '../../../services/config.service';
import { OperationCardManagementComponent } from '../operation-card-management/operation-card-management.component';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [MiniMapComponent, ChildReportCardComponent, ValidationFormComponent, InspectionFormComponent, OperationCardComponent, OperationCardManagementComponent, DatePipe, NgClass, TitleCasePipe],
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

  public parentFlowTags: Tag[] = [];
  public childFlowTags: Tag[] = [];
  public childFlowTags1: Tag[] = [];
  public childFlowTags2: Tag[] = [];

  public miniMapData!: MiniMapData;

  constructor(private applicationRef: ApplicationRef, private route: ActivatedRoute, private dictionaryService: DictionaryService, private configService: ConfigService, private reportsService: ReportsService, private archiveDialogService: ArchiveDialogService) {
    effect(async () => {
      this.parentReport = this.reportsService.selectedReportSignal();
      this.childrenReport = await this.reportsService.populateChildrenReports(this.parentReport.childrenIds);
      this.childrenReport.map((report: ReportChild) => {
        if (report.fields.tagFailure != undefined) report = this.reportsService.populateChildFlowTags1(report);
        if (report.fields.subTagFailure != undefined) report = this.reportsService.populateChildFlowTags2(report);
        if (report.fields.tagFailure != undefined) report = this.reportsService.populateFailureTags(report);
        if (report.fields.subTagFailure != undefined) report = this.reportsService.populateFailureSubtags(report);
      });
      this.miniMapData = { location: this.parentReport.location, priority: this.parentReport.priority };
      console.log(this.parentReport);
      // console.log(this.childrenReport);
      this.discardDuplicatedReportChildFlowTags1(this.childrenReport);
      this.discardDuplicatedReportChildFlowTags2(this.childrenReport);
      this.discardDuplicatedReportFailureTags(this.childrenReport);
      this.discardDuplicatedReportFailureSubTags(this.childrenReport);
    });
    effect(() => this.techElementTags = this.dictionaryService.techElementTagsSignal());
    effect(() => this.failureTags = this.dictionaryService.failureTagsSignal());
    effect(() => this.parentFlowTags = this.configService.parentFlowTagsSignal());
  }

  async ngOnInit(): Promise<void> {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.reportsService.selectReport(this.id);
    }
  }

  public archiveReportClick(): void {
    this.archiveDialogService.parentReport = this.parentReport;

    const div = document.createElement('div');
    div.id = 'archive-dialog';
    document.body.append(div);
    const componentRef = createComponent(ArchiveDialogComponent, { hostElement: div, environmentInjector: this.applicationRef.injector });
    this.applicationRef.attachView(componentRef.hostView);
    componentRef.changeDetectorRef.detectChanges();
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

  private discardDuplicatedReportChildFlowTags1(childrenReport: ReportChild[]): void {
    let tags: Tag[] = [];
    childrenReport.forEach((report: ReportChild) => {
      report.fields.childFlowTags1.forEach((tag: Tag) => {
        if (!tags.some(existingTag => existingTag.id === tag.id)) tags.push(tag);
      });
    });
    this.childFlowTags1 = [...tags];
    this.childFlowTags = [...tags];
  }

  private discardDuplicatedReportChildFlowTags2(childrenReport: ReportChild[]): void {
    let tags: Tag[] = [];
    childrenReport.forEach((report: ReportChild) => {
      report.fields.childFlowTags2.forEach((tag: Tag) => {
        if (!tags.some(existingTag => existingTag.id === tag.id)) tags.push(tag);
      });
    });
    this.childFlowTags2 = [...tags];
    this.childFlowTags = [...tags];
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

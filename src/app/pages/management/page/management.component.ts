import { ApplicationRef, Component, ViewChild, createComponent, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportParent } from '../../../models/report-parent.model';
import { ReportChild } from '../../../models/report-child.model';
import { TechElementTag } from '../../../models/tech-element-tag.model';
import { DictionaryService } from '../../../services/dictionary.service';
import { ValidationFormComponent } from '../validation-form/validation-form.component';
import { ChildReportFiltersFormData, ReportsService } from '../../../services/reports.service';
import { FailureTag } from '../../../models/failure-tag.model';
import { DatePipe, KeyValuePipe, NgClass, TitleCasePipe } from '@angular/common';
import { FailureSubTag } from '../../../models/failure-subtag.model';
import { ChildReportCardComponent } from '../../../components/child-report-card/child-report-card.component';
import { InspectionFormComponent } from '../inspection-form/inspection-form.component';
import { OperationCardComponent } from '../operation-card/operation-card.component';
import { MiniMapComponent } from '../../../components/mini-map/mini-map.component';
import { MiniMapData } from '../../../services/map.service';
import { ArchiveDialogComponent } from '../../../components/archive-dialog/archive-dialog.component';
import { ArchiveDialogService } from '../../../observables/archive-dialog.service';
import { ReportTagGroup, TagGroup } from '../../../models/tag.model';
import { ConfigService } from '../../../services/config.service';
import { OperationCardManagementComponent } from '../operation-card-management/operation-card-management.component';
import { OPERATIONTYPE } from '../../../models/operation.model';
import { ChildReportsFiltersComponent } from '../../../components/child-reports-filters/child-reports-filters.component';
import { WebAppConfig } from '../../../models/config.model';
import { ControlLabelPipe } from '../../../pipes/control-label.pipe';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [MiniMapComponent, ChildReportsFiltersComponent, ChildReportCardComponent, ValidationFormComponent, InspectionFormComponent, OperationCardComponent, OperationCardManagementComponent, DatePipe, NgClass, TitleCasePipe, KeyValuePipe, ControlLabelPipe],
  templateUrl: './management.component.html',
  styleUrl: './management.component.scss'
})
export class ManagementComponent {
  public config: WebAppConfig = this.configService.config;
  public tagGroups: TagGroup[] = this.configService.tagGroups;
  public childTagGroups: TagGroup[] = this.configService.childTagGroups;
  public id: string | null = null;
  public parentReport: ReportParent = ReportParent.createEmpty();

  public techElementTags: TechElementTag[] = [];
  public failureTags: FailureTag[] = [];
  public reportFailureTags: FailureTag[] = [];
  public reportFailureSubTags: FailureSubTag[] = [];

  public childrenReport: ReportChild[] = [];
  public filteredChildrenReport: ReportChild[] = [];

  public childFlowTags: ReportTagGroup[] = [];

  public miniMapData!: MiniMapData;

  constructor(private applicationRef: ApplicationRef, private route: ActivatedRoute, private dictionaryService: DictionaryService, private configService: ConfigService, private reportsService: ReportsService, private archiveDialogService: ArchiveDialogService) {
    effect(async () => {
      this.parentReport = this.reportsService.selectedReportSignal();
      // console.log(this.parentReport);      
      this.childrenReport = await this.reportsService.populateChildrenReports(this.parentReport.childrenIds);
      if (this.parentReport.closingChildId) this.childrenReport.unshift(await this.reportsService.getChildReportById(this.parentReport.closingChildId));
      this.childrenReport = this.childrenReport.map((report: ReportChild) => {
        report.tags = this.reportsService.parseReportTags(report.fields, 'child');
        return report;
      });

      this.miniMapData = { location: this.parentReport.location, priority: this.parentReport.priority };

      let tagGroups: ReportTagGroup[] = [];
      this.childrenReport.map((report: ReportChild) => {
        if (report.tags) report.tags.map((tagGroup: ReportTagGroup) => tagGroups.push(tagGroup))
      });
      this.childFlowTags = this.reportsService.mergeReportTagGroups(tagGroups);

      this.filteredChildrenReport = this.childrenReport;
    });
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

  public filterChildReports(filter: ChildReportFiltersFormData) {
    this.filteredChildrenReport = [];

    if (filter.inspection) {
      this.filteredChildrenReport = this.filteredChildrenReport.concat(
        this.childrenReport.filter((report: ReportChild) =>
          report.flowId === OPERATIONTYPE.InspectionHorizontal || report.flowId === OPERATIONTYPE.InspectionVertical
        )
      );
    }

    if (filter.maintenance) {
      this.filteredChildrenReport = this.filteredChildrenReport.concat(
        this.childrenReport.filter((report: ReportChild) => report.flowId === OPERATIONTYPE.Maintenance)
      );
    }

    if (filter.other) {
      this.filteredChildrenReport = this.filteredChildrenReport.concat(
        this.childrenReport.filter((report: ReportChild) =>
          report.flowId !== OPERATIONTYPE.InspectionHorizontal && report.flowId !== OPERATIONTYPE.InspectionVertical && report.flowId !== OPERATIONTYPE.Maintenance
        )
      );
    }

    this.filteredChildrenReport.sort((a, b) => b.creationTime.getTime() - a.creationTime.getTime())
  }

  public hasMatchfingField(groupId: string): boolean {
    return Object.keys(this.parentReport.fields).some(key => key === groupId);
  }

  public getTags(groupId: string): string[] {
    const field: string[] = this.parentReport.fields[groupId];
    return field ? field : [];
  }
}
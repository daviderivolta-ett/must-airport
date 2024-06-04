import { ApplicationRef, Component, ViewChild, createComponent, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportParent } from '../../../models/report-parent.model';
import { ReportChild } from '../../../models/report-child.model';
import { ValidationFormComponent } from '../validation-form/validation-form.component';
import { ChildReportFiltersFormData, ReportsService } from '../../../services/reports.service';
import { DatePipe, KeyValuePipe, NgClass, TitleCasePipe } from '@angular/common';
import { ChildReportCardComponent } from '../../../components/child-report-card/child-report-card.component';
import { InspectionFormComponent } from '../inspection-form/inspection-form.component';
import { OperationCardComponent } from '../operation-card/operation-card.component';
import { MiniMapComponent } from '../../../components/mini-map/mini-map.component';
import { MiniMapData } from '../../../services/map.service';
import { ArchiveDialogComponent } from '../../../components/archive-dialog/archive-dialog.component';
import { ArchiveDialogService } from '../../../observables/archive-dialog.service';
import { TagGroup } from '../../../models/tag.model';
import { ConfigService } from '../../../services/config.service';
import { OperationCardManagementComponent } from '../operation-card-management/operation-card-management.component';
import { OPERATIONTYPE } from '../../../models/operation.model';
import { ChildReportsFiltersComponent } from '../../../components/child-reports-filters/child-reports-filters.component';
import { WebAppConfig } from '../../../models/config.model';
import { ControlLabelPipe } from '../../../pipes/control-label.pipe';
import { UtilsService } from '../../../services/utils.service';

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
  public parentTagGroups: TagGroup[] = [];
  public childTagGroups: TagGroup[] = [];

  public childrenFields: any = {};

  public id: string | null = null;
  public parentReport: ReportParent = ReportParent.createEmpty();
  public childrenReport: ReportChild[] = [];
  public filteredChildrenReport: ReportChild[] = [];

  public miniMapData!: MiniMapData;

  constructor(private applicationRef: ApplicationRef,
    private route: ActivatedRoute,
    private configService: ConfigService,
    private reportsService: ReportsService,
    private archiveDialogService: ArchiveDialogService,
    private utilsService: UtilsService) {

    effect(async () => {
      this.parentReport = this.reportsService.selectedReportSignal();  
      this.childrenReport = await this.reportsService.populateChildrenReports(this.parentReport.childrenIds);

      if (this.parentReport.closingChildId) this.childrenReport.unshift(await this.reportsService.getChildReportById(this.parentReport.closingChildId));

      this.miniMapData = { location: this.parentReport.location, priority: this.parentReport.priority };

      this.filteredChildrenReport = [...this.childrenReport];
      this.childrenFields = this.getCumulativeChildrenFields(this.childrenReport);

    });

    effect(() => this.parentTagGroups = this.configService.parentTagGroupsSignal());
    effect(() => this.childTagGroups = this.configService.childTagGroupsSignal());
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

  private getCumulativeChildrenFields(reports: ReportChild[]): { [key: string]: string[] } {
    let fields: { [key: string]: string[] } = {};
    let r: ReportChild[] = this.utilsService.deepClone(reports);

    r.forEach((report: ReportChild) => {
      for (const key in report.fields) {
        if (!fields[key]) {
          fields[key] = report.fields[key];
        } else {
          if (Array.isArray(report.fields[key])) {
            report.fields[key].forEach((id: string) => fields[key].push(id));
          }
        }
      }
    });

    for (const key in fields) {
      if (Array.isArray(fields[key])) {
        fields[key] = [...new Set(fields[key])];
      }
    }

    return fields;
  }

  public hasMatchingField(groupId: string): boolean {
    return Object.keys(this.parentReport.fields).some(key => key === groupId);
  }

  public getTags(groupId: string): string[] {
    const field: string[] = this.parentReport.fields[groupId];
    return field ? field : [];
  }

  public hasChildrenMatchingFields(groupId: string): boolean {
    return Object.keys(this.childrenFields).some(key => key === groupId);
  }

  public getChildrenTags(groupId: string): string[] {
    const field: string[] = this.childrenFields[groupId];
    return field ? field : [];
  }
}
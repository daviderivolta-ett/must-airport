import { Component, Input, WritableSignal, effect, signal } from '@angular/core';
import { ReportParent } from '../../models/report-parent.model';
import { ChildReportFiltersFormData, ReportParentClosingDataDb, ReportParentDb, ReportsService } from '../../services/reports.service';
import { ReportChild } from '../../models/report-child.model';
import { ReportTagGroup, Tag, TagGroup } from '../../models/tag.model';
import { MiniMapData } from '../../services/map.service';
import { GeoPoint } from 'firebase/firestore';
import { PRIORITY } from '../../models/priority.model';
import { ConfigService } from '../../services/config.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { DatePipe, KeyValuePipe, NgClass } from '@angular/common';
import { MiniMapComponent } from '../mini-map/mini-map.component';
import { ChildReportCardComponent } from '../child-report-card/child-report-card.component';
import { ChildReportsFiltersComponent } from '../child-reports-filters/child-reports-filters.component';
import { OPERATIONTYPE } from '../../models/operation.model';
import { WebAppConfig } from '../../models/config.model';
import { ControlLabelPipe } from '../../pipes/control-label.pipe';
import { SentenceCasePipe } from '../../pipes/sentence-case.pipe';
import { LabelPipe } from '../../pipes/label.pipe';
import { HoverTooltipDirective } from '../../directives/hover-tooltip.directive';
import { ConfirmDialogService } from '../../observables/confirm-dialog.service';
import { CONFIRMDIALOG } from '../../models/confirm-dialog.model';

@Component({
  selector: 'app-parent-report-detail',
  standalone: true,
  imports: [
    DatePipe,
    KeyValuePipe,
    LabelPipe,
    ControlLabelPipe,
    SentenceCasePipe,
    HoverTooltipDirective,
    NgClass,
    MiniMapComponent,
    ChildReportCardComponent,
    ChildReportsFiltersComponent],
  templateUrl: './parent-report-detail.component.html',
  styleUrl: './parent-report-detail.component.scss'
})
export class ParentReportDetailComponent {
  public config: WebAppConfig = this.configService.config;
  public tagGroups: TagGroup[] = this.configService.tagGroups;
  public parentTagGroups: TagGroup[] = [];
  public childTagGroups: TagGroup[] = [];

  public childrenFields: any = {};

  private parentReportSignal: WritableSignal<ReportParent> = signal(ReportParent.createEmpty());
  public parentReport: ReportParent = ReportParent.createEmpty();
  public childrenReport: ReportChild[] = [];
  public filteredChildrenReport: ReportChild[] = [];

  public miniMapData: MiniMapData = { location: new GeoPoint(0.0, 0.0), priority: PRIORITY.NotAssigned };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    protected reportsService: ReportsService,
    private configService: ConfigService,
    private confirmDialogService: ConfirmDialogService
  ) {
    effect(async () => {
      if (this.parentReportSignal().id === '') return;
      let report: ReportParent = this.parentReportSignal();
      this.parentReport = report;

      this.childrenReport = await this.reportsService.populateChildrenReports(this.parentReport.childrenIds);
      if (this.parentReport.closingChildId) this.childrenReport.unshift(await this.reportsService.getChildReportById(this.parentReport.closingChildId));

      this.miniMapData = { location: this.parentReport.location, priority: this.parentReport.priority };

      this.filteredChildrenReport = this.childrenReport;
      this.childrenFields = this.getCumulativeChildrenFields(this.childrenReport);
    });

    effect(() => this.parentTagGroups = this.configService.parentTagGroupsSignal());
    effect(() => this.childTagGroups = this.configService.childTagGroupsSignal());

    effect(async () => {
      if (this.confirmDialogService.unarchiveReportSignal() !== true) return;

      let data: ReportParentClosingDataDb = {
        archived: false,
        archivingTime: null
      }

      await this.reportsService.setReportById(this.parentReport.id, data);
      this.router.navigate(['/archivio']);

      this.confirmDialogService.unarchiveReportSignal.set(null);
    });

    effect(async () => {
      if (this.confirmDialogService.reopenReportSignal() !== true) return;

      let data = {
        closingChildId: null,
        closingTime: null,
        childrenIds: [...this.parentReport.childrenIds, this.parentReport.closingChildId]
      };

      if (!this.parentReport.closingChildId) return;

      const closingChild: ReportChild = await this.reportsService.getChildReportById(this.parentReport.closingChildId);

      await this.reportsService.setReportById(this.parentReport.id, data);
      await this.reportsService.setChildReportById(closingChild.id, { ...closingChild, closure: false });

      this.router.navigate(['/segnalazioni']);

      this.confirmDialogService.reopenReportSignal.set(null);
    });
  }

  public async ngOnInit(): Promise<void> {
    const id: string | null = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    try {
      const parentReportDb: ReportParentDb = await this.reportsService.getParentReportById(id);
      this.parentReportSignal.set(this.reportsService.parseParentReport(id, parentReportDb));
    } catch (error) {
      this.router.navigate(['/']);
    }
  }

  public async restoreReport(): Promise<void> {
    this.confirmDialogService.createConfirm('Vuoi estrarre la segnalazione dall\'archivio?', CONFIRMDIALOG.UnarchiveReport);
  }

  public async reopenReport(): Promise<void> {
    this.confirmDialogService.createConfirm('Vuoi riaprire la segnalazione?', CONFIRMDIALOG.ReopenReport);
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

    reports.forEach((report: ReportChild) => {
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
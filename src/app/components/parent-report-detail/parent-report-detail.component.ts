import { Component, Input, WritableSignal, effect, signal } from '@angular/core';
import { ReportParent } from '../../models/report-parent.model';
import { ChildReportFiltersFormData, ReportParentClosingDataDb, ReportParentDb, ReportsService } from '../../services/reports.service';
import { ReportChild } from '../../models/report-child.model';
import { Tag } from '../../models/tag.model';
import { MiniMapData } from '../../services/map.service';
import { GeoPoint } from 'firebase/firestore';
import { PRIORITY } from '../../models/priority.model';
import { ConfigService } from '../../services/config.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { MiniMapComponent } from '../mini-map/mini-map.component';
import { ChildReportCardComponent } from '../child-report-card/child-report-card.component';
import { ChildReportsFiltersComponent } from '../child-reports-filters/child-reports-filters.component';
import { OPERATIONTYPE } from '../../models/operation.model';

@Component({
  selector: 'app-parent-report-detail',
  standalone: true,
  imports: [DatePipe, NgClass, MiniMapComponent, ChildReportCardComponent, ChildReportsFiltersComponent],
  templateUrl: './parent-report-detail.component.html',
  styleUrl: './parent-report-detail.component.scss'
})
export class ParentReportDetailComponent {
  private parentReportSignal: WritableSignal<ReportParent> = signal(ReportParent.createEmpty());
  public parentReport: ReportParent = ReportParent.createEmpty();

  public childrenReport: ReportChild[] = [];
  public filteredChildrenReport: ReportChild[] = [];

  public parentFlowTags: Tag[] = [];
  public childFlowTags: Tag[] = [];
  public childFlowTags1: Tag[] = [];
  public childFlowTags2: Tag[] = [];

  public miniMapData: MiniMapData = { location: new GeoPoint(0.0, 0.0), priority: PRIORITY.NotAssigned };

  constructor(private router: Router, private route: ActivatedRoute, protected reportsService: ReportsService, private configService: ConfigService) {
    effect(async () => {
      if (this.parentReportSignal().id === '') return;
      let report: ReportParent = this.parentReportSignal();
      report = this.reportsService.populateParentFlowTags1(report);
      report = this.reportsService.populateParentFlowTags2(report);
      this.parentReport = report;

      this.childrenReport = await this.reportsService.populateChildrenReports(this.parentReport.childrenIds);
      if (this.parentReport.closingChildId) this.childrenReport.unshift(await this.reportsService.getChildReportById(this.parentReport.closingChildId));

      this.childrenReport.map((report: ReportChild) => {
        if (report.fields.tagFailure != undefined) report = this.reportsService.populateChildFlowTags1(report);
        if (report.fields.subTagFailure != undefined) report = this.reportsService.populateChildFlowTags2(report);
      });
      this.miniMapData = { location: this.parentReport.location, priority: this.parentReport.priority };
      // console.log(this.parentReport);    
      // console.log(this.childrenReport);

      this.discardDuplicatedReportChildFlowTags1(this.childrenReport);
      this.discardDuplicatedReportChildFlowTags2(this.childrenReport);

      this.filteredChildrenReport = this.childrenReport;
    });

    // effect(() => this.parentFlowTags = this.configService.parentFlowTagsSignal());
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
    let data: ReportParentClosingDataDb = {
      archived: false,
      archivingTime: null
    }

    await this.reportsService.setReportById(this.parentReport.id, data);
    this.router.navigate(['/archivio']);
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
}
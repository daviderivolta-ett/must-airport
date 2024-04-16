import { Component, Input, WritableSignal, effect, signal } from '@angular/core';
import { ReportParent } from '../../models/report-parent.model';
import { ReportParentDb, ReportsService } from '../../services/reports.service';
import { ReportChild } from '../../models/report-child.model';
import { Tag } from '../../models/tag.model';
import { MiniMapData } from '../../services/map.service';
import { GeoPoint } from 'firebase/firestore';
import { PRIORITY } from '../../models/priority.model';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-parent-report-detail',
  standalone: true,
  imports: [],
  templateUrl: './parent-report-detail.component.html',
  styleUrl: './parent-report-detail.component.scss'
})
export class ParentReportDetailComponent {
  private _input: ReportParent = ReportParent.createEmpty();
  @Input() public set input(value: ReportParent) {
    this._input = value;
    this.parentReportSignal.set(this.input);
  }
  public get input(): ReportParent {
    return this._input;
  }

  private parentReportSignal: WritableSignal<ReportParent> = signal(ReportParent.createEmpty());
  public parentReport: ReportParent = ReportParent.createEmpty();
  public childrenReport: ReportChild[] = [];

  public parentFlowTags: Tag[] = [];
  public childFlowTags: Tag[] = [];
  public childFlowTags1: Tag[] = [];
  public childFlowTags2: Tag[] = [];

  public miniMapData: MiniMapData = { location: new GeoPoint(0.0, 0.0), priority: PRIORITY.NotAssigned };

  constructor(protected reportsService: ReportsService, private configService: ConfigService) {
    effect(async () => {
      if (this.parentReportSignal().id === '') return;
      let report: ReportParent = this.parentReportSignal();
      report = this.reportsService.populateParentFlowTags1(report);
      report = this.reportsService.populateParentFlowTags2(report);
      this.parentReport = report;
      
      this.childrenReport = await this.reportsService.populateChildrenReports(this.parentReport.childrenIds);
      if (this.parentReport.closingChildId) this.childrenReport.push(await this.reportsService.getChildReportById(this.parentReport.closingChildId));

      this.childrenReport.map((report: ReportChild) => {
        if (report.fields.tagFailure != undefined) report = this.reportsService.populateChildFlowTags1(report);
        if (report.fields.subTagFailure != undefined) report = this.reportsService.populateChildFlowTags2(report);
      });
      this.miniMapData = { location: this.parentReport.location, priority: this.parentReport.priority };
      // console.log(this.parentReport);    
      // console.log(this.childrenReport);

      this.discardDuplicatedReportChildFlowTags1(this.childrenReport);
      this.discardDuplicatedReportChildFlowTags2(this.childrenReport);
    });

    // effect(() => this.parentFlowTags = this.configService.parentFlowTagsSignal());
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

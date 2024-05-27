import { Component, Input } from '@angular/core';
import { ReportParent } from '../../../models/report-parent.model';
import { DatePipe, NgClass } from '@angular/common';
import { ReportChild } from '../../../models/report-child.model';
import { ReportParentClosingDataDb, ReportsService } from '../../../services/reports.service';
import { HoverTooltipDirective } from '../../../directives/hover-tooltip.directive';
import { Router } from '@angular/router';
import { ReportTag, ReportTagGroup, Tag, TagGroup } from '../../../models/tag.model';

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
      reports = reports.map((report: ReportChild) => {
        report.tags = this.reportsService.parseReportTags(report.fields, 'child');
        return report;
      });
      this.childrenReport = reports;

      let tagGroups: ReportTagGroup[] = [];
      this.childrenReport.map((report: ReportChild) => {
        if (report.tags) report.tags.map((tagGroup: ReportTagGroup) => tagGroups.push(tagGroup))
      });
      this.childFlowTags = this.reportsService.mergeReportTagGroups(tagGroups);
    });
    this._parentReport = value;
  }

  public childrenReport: ReportChild[] = [];
  public childFlowTags: ReportTagGroup[] = [];

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
}
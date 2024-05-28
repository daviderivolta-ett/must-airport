import { Component, Input } from '@angular/core';
import { ReportParent } from '../../../models/report-parent.model';
import { DatePipe, KeyValuePipe, NgClass } from '@angular/common';
import { ReportChild } from '../../../models/report-child.model';
import { ReportParentClosingDataDb, ReportsService } from '../../../services/reports.service';
import { HoverTooltipDirective } from '../../../directives/hover-tooltip.directive';
import { Router } from '@angular/router';
import { ReportTagGroup, TagGroup} from '../../../models/tag.model';
import { ControlLabelPipe } from '../../../pipes/control-label.pipe';

@Component({
  selector: 'app-archive-card',
  standalone: true,
  imports: [DatePipe, KeyValuePipe, ControlLabelPipe, NgClass, HoverTooltipDirective],
  templateUrl: './archive-card.component.html',
  styleUrl: './archive-card.component.scss'
})
export class ArchiveCardComponent {
  private _tagGroups: TagGroup[] = [];
  public get tagGroups(): TagGroup[] {
    return this._tagGroups;
  }
  @Input() public set tagGroups(value: TagGroup[]) {
    if (value.length === 0) return;
    this._tagGroups = value;
  }

  public childrenFields: any = {};

  private _parentReport: ReportParent = ReportParent.createEmpty();

  public get parentReport(): ReportParent {
    return this._parentReport;
  }

  @Input() public set parentReport(value: ReportParent) {
    const childrenReport: Promise<ReportChild>[] = value.childrenIds.map(async (id: string) => {
      return await this.reportsService.getChildReportById(id);
    });

    Promise.all(childrenReport).then((reports: ReportChild[]) => {
      this.childrenReport = reports;
      this.childrenFields = this.getCumulativeChildrenFields(this.childrenReport);
    });
    this._parentReport = value;
  }

  public childrenReport: ReportChild[] = [];
  public childFlowTags: ReportTagGroup[] = [];

  constructor(private reportsService: ReportsService, private router: Router) {}

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
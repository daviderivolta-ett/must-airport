import { Component, Input } from '@angular/core';
import { Inspection } from '../../models/operation.model';
import { ReportsService } from '../../services/reports.service';
import { ReportParent } from '../../models/report-parent.model';

@Component({
  selector: 'app-operation-card-base',
  standalone: true,
  imports: [],
  templateUrl: './operation-card-base.component.html',
  styleUrl: './operation-card-base.component.scss'
})
export class OperationCardBaseComponent {
  private _operation: Inspection | null = null;
  protected _report: ReportParent | null = null;

  public get operation(): Inspection | null {
    return this._operation;
  }

  @Input() public set operation(value: Inspection) {    
    if (!value) return;
    this._operation = value;

    if (!this.operation) return;
    let report: ReportParent | null = this.getParentReportByOperationId(this.operation.id);

    if (!report) return;
    this.report = report;
  }

  protected set report(value: ReportParent) {
    this._report = value;
  }

  protected get report(): ReportParent | null {
    return this._report;
  }

  constructor(protected reportsService: ReportsService) { }

  private getParentReportByOperationId(id: string): ReportParent | null {
    let report: ReportParent | null = null;

    this.reportsService.reports.forEach((r: ReportParent) => {
      r.operations.forEach((op: string) => {
        if (op === id) {
          report = r;
          return;
        }
      });

    });

    this.reportsService.archivedReports.forEach((r: ReportParent) => {
      r.operations.forEach((op: string) => {
        if (op === id) {
          report = r;
          return;
        }
      });

    });

    return report;
  }
}
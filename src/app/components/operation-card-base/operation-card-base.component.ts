import { Component, Input } from '@angular/core';
import { Operation } from '../../models/operation.model';
import { ReportsService } from '../../services/reports.service';
import { ReportParent } from '../../models/report-parent.model';
import { MiniMapData } from '../../services/map.service';

@Component({
  selector: 'app-operation-card-base',
  standalone: true,
  imports: [],
  templateUrl: './operation-card-base.component.html',
  styleUrl: './operation-card-base.component.scss'
})
export class OperationCardBaseComponent {
  private _operation: Operation | null = null;
  protected _report: ReportParent | null = null;

  public get operation(): Operation | null {
    return this._operation;
  }

  @Input() public set operation(value: Operation) {
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

  constructor(private reportsService: ReportsService) { }

  private getParentReportByOperationId(id: string): ReportParent | null {
    let report: ReportParent | null = null;

    this.reportsService.reports.forEach((r: ReportParent) => {
      r.operations.forEach((op: Operation) => {
        if (op.id === id) {
          report = r;
          return;
        }
      });

    })
    return report;
  }
}
import { Component, Input, effect } from '@angular/core';
import { DialogService } from '../../../observables/dialog.service';
import { ReportParent } from '../../../models/report-parent.model';
import { ReportChild } from '../../../models/report-child.model';
import { ReportsService } from '../../../services/reports.service';
import { DatePipe, KeyValuePipe, NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ChildReportCardComponent } from '../../../components/child-report-card/child-report-card.component';
import { CloseEscapeDirective } from '../../../directives/close-escape.directive';
import { LoggedUser } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';
import { MiniMapComponent } from '../../../components/mini-map/mini-map.component';
import { MiniMapData } from '../../../services/map.service';
import { VERTICAL } from '../../../models/app-flow.model';
import { PRIORITY } from '../../../models/priority.model';
import { GeoPoint } from 'firebase/firestore';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [MiniMapComponent, ChildReportCardComponent, DatePipe, NgClass, KeyValuePipe, RouterLink, CloseEscapeDirective],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {
  public isOpen: boolean = false;
  public parentReport: ReportParent = ReportParent.createEmpty();
  public childrenReport: ReportChild[] = [];
  public loggedUser: LoggedUser | null = null;
  public miniMapData!: MiniMapData;
  public currentApp: VERTICAL | null = null;

  constructor(private dialogService: DialogService, private reportsService: ReportsService, private router: Router, private authService: AuthService) {
    effect(() => this.isOpen = this.dialogService.isOpen());
    effect(() => this.loggedUser = this.authService.loggedUserSignal());
    effect(() => this.currentApp = this.authService.currentAppSignal());

    effect(async () => {
      const report: ReportParent = this.dialogService.report();
      if (report.id.length === 0) return;

      this.parentReport = { ...report };

      const childrenIds: string[] = [...this.parentReport.childrenIds];
      if (this.parentReport.closingChildId) childrenIds.push(this.parentReport.closingChildId);
      this.childrenReport = await this.reportsService.populateChildrenReports(childrenIds);

      this.childrenReport = this.childrenReport.map((report: ReportChild) => {
        report.tags = this.reportsService.parseReportTags(report.fields, 'child');
        return report;
      });

      this.miniMapData = { location: this.parentReport.location, priority: this.parentReport.priority };
      // console.log(this.parentReport);
      // console.log(this.childrenReport);
    });
  }

  public closeDialog(): void {
    this.dialogService.isOpen.set(false);
  }

  public navigateTo(id: string): void {
    this.parentReport.closingChildId ? this.router.navigate(['/archivio', id]) : this.router.navigate(['/gestione', id]);
    this.closeDialog();
  }
}
import { Component, effect } from '@angular/core';
import { DialogService } from '../../../observables/dialog.service';
import { ReportParent } from '../../../models/report-parent.model';
import { ReportChild } from '../../../models/report-child.model';
import { ReportsService } from '../../../services/reports.service';
import { DatePipe, NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ChildReportCardComponent } from '../../../components/child-report-card/child-report-card.component';
import { CloseEscapeDirective } from '../../../directives/close-escape.directive';
import { LoggedUser } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';
import { MiniMapComponent } from '../../../components/mini-map/mini-map.component';
import { MiniMapData } from '../../../services/map.service';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [MiniMapComponent, ChildReportCardComponent, DatePipe, NgClass, RouterLink, CloseEscapeDirective],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {
  public isOpen: boolean = false;
  public parentReport: ReportParent = ReportParent.createEmpty();
  public childrenReport: ReportChild[] = [];
  public loggedUser: LoggedUser | null = null;
  public miniMapData!: MiniMapData;

  constructor(private dialogService: DialogService, private reportsService: ReportsService, private router: Router, private authService: AuthService) {
    effect(() => this.isOpen = this.dialogService.isOpen());
    effect(() => this.loggedUser = this.authService.loggedUserSignal());

    effect(async () => {
      this.parentReport = this.dialogService.report();
      this.childrenReport = await this.reportsService.populateChildrenReports(this.parentReport.childrenIds);
      this.childrenReport.map((report: ReportChild) => {
        if (report.tagFailure != undefined) report = this.reportsService.populateFailureTags(report);
        if (report.subTagFailure != undefined) report = this.reportsService.populateFailureSubtags(report);
      });
      this.miniMapData = { location: this.parentReport.location, priority: this.parentReport.priority };
      // console.log(this.parentReport);
      // console.log(this.childrenReport);
    });
  }

  public closeDialog(): void {
    this.dialogService.isOpen.set(false);
    this.parentReport = ReportParent.createEmpty();
    this.childrenReport = [];
  }

  public navigateTo(id: string): void {
    this.router.navigate(['/gestione', id]);
    this.closeDialog();
  }
}
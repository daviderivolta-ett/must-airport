import { Component, effect } from '@angular/core';
import { DialogService } from '../../../observables/dialog.service';
import { ReportParent } from '../../../models/report-parent.model';
import { ReportChild } from '../../../models/report-child.model';
import { ReportsService } from '../../../services/reports.service';
import { MiniMapData } from '../../../services/map.service';
import { GeoPoint } from 'firebase/firestore';
import { PRIORITY } from '../../../models/priority.model';
import { Router } from '@angular/router';
import { LoggedUser } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';
import { VERTICAL } from '../../../models/vertical.model';
import { DatePipe, NgClass } from '@angular/common';
import { TagGroup } from '../../../models/tag.model';
import { ConfigService } from '../../../services/config.service';
import { ControlLabelPipe } from '../../../pipes/control-label.pipe';
import { MiniMapComponent } from '../../../components/mini-map/mini-map.component';
import { ChildReportCardComponent } from '../../../components/child-report-card/child-report-card.component';
import { CloseEscapeDirective } from '../../../directives/close-escape.directive';

@Component({
  selector: 'app-report-dialog',
  standalone: true,
  imports: [
    NgClass,
    DatePipe,
    ControlLabelPipe,
    MiniMapComponent,
    ChildReportCardComponent,
    CloseEscapeDirective
  ],
  templateUrl: './report-dialog.component.html',
  styleUrl: './report-dialog.component.scss'
})
export class ReportDialogComponent {
  public parentReport: ReportParent = ReportParent.createEmpty();
  public childReports: ReportChild[] = [];
  public minimapData: MiniMapData = { location: new GeoPoint(0.0, 0.0), priority: PRIORITY.NotAssigned }

  public parentTagGroups: TagGroup[] = [];
  public childTagGroups: TagGroup[] = [];

  public loggedUser: LoggedUser | null = null;
  public currentApp: VERTICAL | null = null;

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private router: Router,
    private dialogService: DialogService,
    private reportsService: ReportsService
  ) {
    effect(async () => {
      this.parentReport = this.dialogService.report();

      const childIds: string[] = [...this.parentReport.childrenIds];
      if (this.parentReport.closingChildId) childIds.push(this.parentReport.closingChildId);
      this.childReports = await this.reportsService.populateChildrenReports(childIds);

      this.minimapData = { location: this.parentReport.location, priority: this.parentReport.priority };
    });

    effect(() => this.parentTagGroups = this.configService.parentTagGroupsSignal());
    effect(() => this.childTagGroups = this.configService.childTagGroupsSignal());

    effect(() => this.loggedUser = this.authService.loggedUserSignal());
    effect(() => this.currentApp = this.authService.currentAppSignal());
  }

  public close(): void {
    this.dialogService.removeDialog();
  }

  public navigateTo(id: string): void {
    this.parentReport.closingChildId ? this.router.navigate(['/archivio', id]) : this.router.navigate(['/gestione', id]);
    this.dialogService.removeDialog();
  }

  public hasMatchingField(groupId: string): boolean {
    return Object.keys(this.parentReport.fields).some(key => key === groupId);
  }

  public getTags(groupId: string): string[] {
    const field: string[] = this.parentReport.fields[groupId];
    return field ? field : [];
  }
}
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
import { VERTICAL } from '../../../models/vertical.model';
import { TagGroup } from '../../../models/tag.model';
import { ControlLabelPipe } from '../../../pipes/control-label.pipe';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [MiniMapComponent, ChildReportCardComponent, DatePipe, NgClass, KeyValuePipe, ControlLabelPipe, RouterLink, CloseEscapeDirective],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {
  private _childTagGroups: TagGroup[] = [];
  public get childTagGroups(): TagGroup[] {
    return this._childTagGroups;
  }
  @Input() public set childTagGroups(value: TagGroup[]) {
    if (value.length === 0) return;
    this._childTagGroups = value;
  }

  private _parentTagGroups: TagGroup[] = [];
  public get parentTagGroups(): TagGroup[] {
    return this._parentTagGroups;
  }
  @Input() public set parentTagGroups(value: TagGroup[]) {
    if (value.length === 0) return;
    this._parentTagGroups = value;
  }

  public isOpen: boolean = false;
  public parentReport: ReportParent = ReportParent.createEmpty();
  public childrenReport: ReportChild[] = [];
  public loggedUser: LoggedUser | null = null;
  public miniMapData!: MiniMapData;
  public currentApp: VERTICAL | null = null;

  constructor(private dialogService: DialogService, private reportsService: ReportsService, private router: Router, private authService: AuthService) {
    // effect(() => this.isOpen = this.dialogService.isOpen());
    effect(() => this.loggedUser = this.authService.loggedUserSignal());
    effect(() => this.currentApp = this.authService.currentAppSignal());

    effect(async () => {
      if (this.dialogService.report().id.length === 0) return;
      this.parentReport = this.dialogService.report();
     
      const childrenIds: string[] = [...this.parentReport.childrenIds];
      if (this.parentReport.closingChildId) childrenIds.push(this.parentReport.closingChildId);
      this.childrenReport = await this.reportsService.populateChildrenReports(childrenIds);
    
      this.miniMapData = { location: this.parentReport.location, priority: this.parentReport.priority };
    });
  }

  public closeDialog(): void {
    this.dialogService.isOpen.set(false);
  }

  public navigateTo(id: string): void {
    this.parentReport.closingChildId ? this.router.navigate(['/archivio', id]) : this.router.navigate(['/gestione', id]);
    this.closeDialog();
  }

  public hasMatchingField(groupId: string): boolean {
    return Object.keys(this.parentReport.fields).some(key => key === groupId);
  }

  public getTags(groupId: string): string[] {
    const field: string[] = this.parentReport.fields[groupId];
    return field ? field : [];
  }
}
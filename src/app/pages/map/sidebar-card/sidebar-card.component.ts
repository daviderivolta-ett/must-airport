import { Component, Input } from '@angular/core';
import { ReportParent } from '../../../models/report-parent.model';
import { DatePipe, KeyValuePipe, NgClass } from '@angular/common';
import { DialogComponent } from '../dialog/dialog.component';
import { DialogService } from '../../../observables/dialog.service';
import { SidebarService } from '../../../observables/sidebar.service';
import { TagGroup } from '../../../models/tag.model';
import { ControlLabelPipe } from '../../../pipes/control-label.pipe';

@Component({
  selector: 'app-sidebar-card',
  standalone: true,
  imports: [NgClass, DatePipe, KeyValuePipe, ControlLabelPipe, DialogComponent],
  templateUrl: './sidebar-card.component.html',
  styleUrl: './sidebar-card.component.scss'
})
export class SidebarCardComponent {
  @Input() public report: ReportParent = ReportParent.createEmpty();
  @Input() public parentTagGroups: TagGroup[] = [];

  constructor(private dialogService: DialogService, private sidebarService: SidebarService) { }

  public openDialog(): void {
    this.sidebarService.isOpen.set(false);
    this.dialogService.report.set(this.report);
    // this.dialogService.isOpen.set(true);
    this.dialogService.createDialog();
  }
  
  public closeDialog(): void {
    this.dialogService.isOpen.set(false);
    this.dialogService.report.set(ReportParent.createEmpty());
  }

  public hasMatchingField(groupId: string): boolean {
    return Object.keys(this.report.fields).some(key => key === groupId);
  }

  public getTags(groupId: string): string[] {
    const field: string[] = this.report.fields[groupId];
    return field ? field : [];
  }
}
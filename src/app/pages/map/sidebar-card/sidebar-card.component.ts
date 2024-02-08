import { Component, Input } from '@angular/core';
import { ReportParent } from '../../../models/report-parent.model';
import { NgClass } from '@angular/common';
import { DialogComponent } from '../dialog/dialog.component';
import { DialogService } from '../../../observables/dialog.service';
import { SidebarService } from '../../../observables/sidebar.service';

@Component({
  selector: 'app-sidebar-card',
  standalone: true,
  imports: [NgClass, DialogComponent],
  templateUrl: './sidebar-card.component.html',
  styleUrl: './sidebar-card.component.scss'
})
export class SidebarCardComponent {
  @Input() public report: ReportParent = ReportParent.createEmpty();

  constructor(private dialogService: DialogService, private sidebarService: SidebarService) { }

  public openDialog(): void {
    this.sidebarService.isOpen.set(false);
    this.dialogService.isOpen.set(true);
    this.dialogService.report.set(this.dialogService.transformLanguage(this.report));
  }

  public closeDialog(): void {
    this.dialogService.isOpen.set(false);
  }
}
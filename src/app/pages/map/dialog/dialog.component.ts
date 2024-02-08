import { Component, effect } from '@angular/core';
import { DialogService } from '../../../observables/dialog.service';
import { ReportParent } from '../../../models/report-parent.model';
import { ReportChild } from '../../../models/report-child.model';
import { ReportsService } from '../../../services/reports.service';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {
  public isOpen: boolean = false;
  public reportParent: ReportParent = ReportParent.createEmpty();
  public reportChildren: ReportChild[] = [];

  constructor(private dialogService: DialogService, private reportsService: ReportsService) {
    effect(() => {
      this.isOpen = this.dialogService.isOpen();
    });

    effect(async () => {
      this.reportParent = this.dialogService.report();
      this.reportChildren = await this.reportsService.populateChildrenReports(this.reportParent.childrenIds);      
    });
  }

  closeDialog():void {
    this.dialogService.isOpen.set(false);
  }
}
import { Component, Input } from '@angular/core';
import { ReportParent } from '../../../models/report-parent.model';
import { DatePipe, NgClass } from '@angular/common';
import { DialogComponent } from '../dialog/dialog.component';
import { DialogService } from '../../../observables/dialog.service';
import { SidebarService } from '../../../observables/sidebar.service';
import { WebAppConfig } from '../../../models/config.model';

@Component({
  selector: 'app-sidebar-card',
  standalone: true,
  imports: [NgClass, DatePipe, DialogComponent],
  templateUrl: './sidebar-card.component.html',
  styleUrl: './sidebar-card.component.scss'
})
export class SidebarCardComponent {
  private _config: WebAppConfig = WebAppConfig.createEmpty();
  public get config(): WebAppConfig {
    return this._config;
  }
  @Input() public set config(value: WebAppConfig) {
    this._config = value;
  };

  @Input() public report: ReportParent = ReportParent.createEmpty();

  constructor(private dialogService: DialogService, private sidebarService: SidebarService) { }

  public openDialog(): void {
    this.sidebarService.isOpen.set(false);
    // this.dialogService.report.set(this.dialogService.transformLanguage(this.report));
    this.dialogService.report.set(this.report);
    this.dialogService.isOpen.set(true);
  }
  
  public closeDialog(): void {
    this.dialogService.isOpen.set(false);
    this.dialogService.report.set(ReportParent.createEmpty());
  }
}
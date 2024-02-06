import { Component, effect } from '@angular/core';
import { NgClass } from '@angular/common';
import { SidebarService } from '../../../observables/sidebar.service';
import { ReportsService } from '../../../services/reports.service';
import { ReportParent } from '../../../models/report-parent.model';
import { SidebarCardComponent } from '../sidebar-card/sidebar-card.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgClass, SidebarCardComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  public reports: ReportParent[] = [];

  constructor(public sidebarService: SidebarService, private reportsService: ReportsService) {
    effect(() => {
      this.reports = this.reportsService.reports();
    });
  }

  public toggleSidebar() {
    this.sidebarService.isOpen.set(!this.sidebarService.isOpen());
  }
}
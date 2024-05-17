import { Component, Signal, computed, effect } from '@angular/core';
import { ReportParent } from '../../../models/report-parent.model';
import { ReportsService } from '../../../services/reports.service';
import { ArchiveCardComponent } from '../archive-card/archive-card.component';

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [ArchiveCardComponent],
  templateUrl: './archive.component.html',
  styleUrl: './archive.component.scss'
})
export class ArchiveComponent {
  public reports: ReportParent[] = [];
  // public reportsSignal: Signal<ReportParent[]> = computed(() => {
  //   const archivedReports = this.reportsService.archivedReportsSignal();
  //   const closedReports = this.reportsService.closedReportSignal();    
  //   return [...archivedReports, ...closedReports];
  // });
  // public archivedReports: ReportParent[] = [];
  // public closedReports: ReportParent[] = [];

  constructor(private reportsService: ReportsService) {
    effect(() => {
      // const reports: ReportParent[] = this.reportsSignal();
      const reports: ReportParent[] = this.reportsService.archivedReportsSignal();
      this.reports = reports.sort((a, b) => a.creationTime.getTime() - b.creationTime.getTime()).reverse();   
    });
  }
}

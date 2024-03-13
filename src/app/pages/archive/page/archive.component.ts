import { Component, effect } from '@angular/core';
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
  public archivedReports: ReportParent[] = [];

  constructor(private reportsService: ReportsService) {
    effect(() => {
      if (this.reportsService.archivedReportsSignal() === null) return;
      this.archivedReports = this.reportsService.archivedReportsSignal();    
    })
  }
}

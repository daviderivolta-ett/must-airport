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
  public parentReports: ReportParent[] = [];

  constructor(private reportsService: ReportsService) {
    effect(() => {
      if (this.reportsService.reportsSignal() === null) return;
      this.parentReports = this.reportsService.reportsSignal();    
    })
  }
}

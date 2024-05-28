import { Component, Signal, computed, effect } from '@angular/core';
import { ReportParent } from '../../../models/report-parent.model';
import { ReportsService } from '../../../services/reports.service';
import { ArchiveCardComponent } from '../archive-card/archive-card.component';
import { TagGroup } from '../../../models/tag.model';
import { ConfigService } from '../../../services/config.service';

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [ArchiveCardComponent],
  templateUrl: './archive.component.html',
  styleUrl: './archive.component.scss'
})
export class ArchiveComponent {
  public reports: ReportParent[] = [];
  public tagGroups: TagGroup[] = this.configService.tagGroups;

  constructor(private configService: ConfigService, private reportsService: ReportsService) {
    effect(() => {
      const reports: ReportParent[] = this.reportsService.archivedReportsSignal();
      this.reports = reports.sort((a, b) => a.creationTime.getTime() - b.creationTime.getTime()).reverse();   
    });
  }
}

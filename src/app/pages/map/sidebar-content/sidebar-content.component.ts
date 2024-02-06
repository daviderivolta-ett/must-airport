import { Component, effect } from '@angular/core';
import { ReportsService } from '../../../services/reports.service';
import { ReportParent } from '../../../models/report-parent.model';
import { SidebarCardComponent } from '../sidebar-card/sidebar-card.component';
import { FailuresService } from '../../../services/failures.service';
import { FailureTag } from '../../../models/failure-tag.model';

@Component({
  selector: 'app-sidebar-content',
  standalone: true,
  imports: [SidebarCardComponent],
  templateUrl: './sidebar-content.component.html',
  styleUrl: './sidebar-content.component.scss'
})
export class SidebarContentComponent {
  public reports: ReportParent[] = [];
  public failureTags: FailureTag[] = [];

  constructor(private reportsService: ReportsService, private failuresService: FailuresService) {
    effect(() => {
      this.reports = this.reportsService.reports();
      // console.log(this.reports);
    });    
  }
}
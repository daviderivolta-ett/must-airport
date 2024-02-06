import { Component, effect } from '@angular/core';
import { FailuresService } from '../../../services/reports.service';
import { ReportParent } from '../../../models/report-parent.model';
import { SidebarCardComponent } from '../sidebar-card/sidebar-card.component';

@Component({
  selector: 'app-sidebar-content',
  standalone: true,
  imports: [SidebarCardComponent],
  templateUrl: './sidebar-content.component.html',
  styleUrl: './sidebar-content.component.scss'
})
export class SidebarContentComponent {
  public reports: ReportParent[] = [];

  constructor(private failuresService: FailuresService) {
    effect(() => {
      this.reports = this.failuresService.reports();      
    });
  }
}
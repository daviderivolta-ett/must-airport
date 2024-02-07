import { Component, effect } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ReportsService } from '../../../services/reports.service';
import { ReportParent } from '../../../models/report-parent.model';
import { TechElementTag } from '../../../models/tech-element-tag.model';

@Component({
  selector: 'app-map-page',
  standalone: true,
  imports: [MapComponent, SidebarComponent],
  templateUrl: './map-page.component.html',
  styleUrl: './map-page.component.scss'
})
export class MapPageComponent {
  public reports: ReportParent[] = [];
  public techElementTags: TechElementTag[] = [];

  constructor(private reportsService: ReportsService) {
    effect(() => {
      this.reports = this.reportsService.reports();
      console.log(this.reports);
    });
  }

  ngOnInit() {
    this.reportsService.getAllParentReports();
  }
}
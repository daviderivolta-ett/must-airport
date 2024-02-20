import { Component, effect } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ReportsService } from '../../../services/reports.service';
import { ReportParent } from '../../../models/report-parent.model';
import { TechElementTag } from '../../../models/tech-element-tag.model';
import { DialogComponent } from '../dialog/dialog.component';
import { CloseEscapeDirective } from '../../../directives/close-escape.directive';

@Component({
  selector: 'app-map-page',
  standalone: true,
  imports: [MapComponent, SidebarComponent, DialogComponent],
  templateUrl: './map-page.component.html',
  styleUrl: './map-page.component.scss'
})
export class MapPageComponent {
  public reports: ReportParent[] = [];
  public techElementTags: TechElementTag[] = [];

  constructor(private reportsService: ReportsService) {
    effect(() => {
      this.reports = this.reportsService.reportsSignal();
      // console.log(this.reports);
    });

    effect(() => {
      this.reports = this.reportsService.filteredReportsSignal();
      // console.log(this.reports);      
    });
  }

  public pippo(): void {
    console.log('ehi');    
  }
}
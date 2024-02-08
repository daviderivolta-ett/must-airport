import { Component, effect } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ReportsService } from '../../../services/reports.service';
import { ReportParent } from '../../../models/report-parent.model';
import { TechElementTag } from '../../../models/tech-element-tag.model';
import { DictionaryService } from '../../../services/dictionary.service';
import { DialogComponent } from '../../../components/dialog/dialog.component';

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

  constructor(private reportsService: ReportsService, private dictionaryService: DictionaryService) {
    effect(() => {
      this.reports = this.reportsService.reports();
      console.log(this.reports);
    });
  }

  async ngOnInit(): Promise<void> {
    await this.reportsService.getAllParentReports();   
  }
}
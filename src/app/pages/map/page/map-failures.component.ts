import { Component } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ReportParent } from '../../../models/report-parent.model';

@Component({
  selector: 'app-map-failures',
  standalone: true,
  imports: [MapComponent, SidebarComponent],
  templateUrl: './map-failures.component.html',
  styleUrl: './map-failures.component.scss'
})
export class MapFailuresComponent {
  public failures: ReportParent [] = [];
  public geoJsonData: any;

  constructor() { }
}

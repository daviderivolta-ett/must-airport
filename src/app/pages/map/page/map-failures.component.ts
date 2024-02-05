import { Component, Input, Signal, SimpleChanges, computed } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { Failure } from '../../../models/failure.model';
import { FailuresService } from '../../../services/failures.service';
import { MapService } from '../../../services/map.service';

@Component({
  selector: 'app-map-failures',
  standalone: true,
  imports: [MapComponent, SidebarComponent],
  templateUrl: './map-failures.component.html',
  styleUrl: './map-failures.component.scss'
})
export class MapFailuresComponent {
  public failures: Failure [] = [];
  public geoJsonData: any;

  constructor() { }
}

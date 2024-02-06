import { Component } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TechElementsService } from '../../../services/tech-elements.service';

@Component({
  selector: 'app-map-failures',
  standalone: true,
  imports: [MapComponent, SidebarComponent],
  templateUrl: './map-failures.component.html',
  styleUrl: './map-failures.component.scss'
})
export class MapFailuresComponent {

  constructor(private techElementsService: TechElementsService) { }
}

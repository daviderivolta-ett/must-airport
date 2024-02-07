import { Component } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TechElementsService } from '../../../services/tech-elements.service';
import { FailuresService } from '../../../services/failures.service';

@Component({
  selector: 'app-map-page',
  standalone: true,
  imports: [MapComponent, SidebarComponent],
  templateUrl: './map-page.component.html',
  styleUrl: './map-page.component.scss'
})
export class MapPageComponent {

  constructor(private techElementsService: TechElementsService, failuresService: FailuresService) { }
}

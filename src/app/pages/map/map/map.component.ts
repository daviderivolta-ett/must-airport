import { Component, effect } from '@angular/core';
import * as Leaflet from 'leaflet';
import { FailuresService } from '../../../services/failures.service';
import { MapService } from '../../../services/map.service';
import { SidebarService } from '../../../observables/sidebar.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent {
  private geoJsonData: any;
  private map!: Leaflet.Map;

  constructor(private failuresService: FailuresService, private mapService: MapService, private sidebarService: SidebarService) {
    effect(() => {
      this.geoJsonData = this.mapService.createGeoJson(this.failuresService.failures());
      this.populateMap(this.geoJsonData);
    });
  }

  ngOnInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = Leaflet.map('map', {
      zoomControl: false,
      maxZoom: 20,
      minZoom: 14
    }).setView([44.41361028797091, 8.844596073925151], 13);

    Leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map);

    Leaflet.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);

    this.map.setMaxBounds(this.map.getBounds());

    this.map.on('click', () => this.sidebarService.isOpen.set(false));
  }

  private populateMap(geoJsonData: any): void {
    Leaflet.geoJSON(geoJsonData, {
      pointToLayer: (feature, latLng) => this.styleMarker(latLng)
    }).addTo(this.map);
  }

  private styleMarker(latLng: Leaflet.LatLng): Leaflet.CircleMarker {
    let options = {
      stroke: true,
      radius: 8,
      weight: 2,
      color: "#b71b28",
      opacity: 1,
      fillColor: "#b71b28",
      fillOpacity: 0.5
    };

    return new Leaflet.CircleMarker(latLng, options);
  }
}

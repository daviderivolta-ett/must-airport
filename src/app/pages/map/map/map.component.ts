import { Component, effect } from '@angular/core';
import * as Leaflet from 'leaflet';
import { GeoJSONFeature, MapService } from '../../../services/map.service';
import { SidebarService } from '../../../observables/sidebar.service';
import { ReportParent } from '../../../models/report-parent.model';
import { ReportsService } from '../../../services/reports.service';
import { DialogService } from '../../../observables/dialog.service';
import { ThemeService } from '../../../services/theme.service';
import { COLORMODE } from '../../../models/color-mode.model';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent {
  public reports: ReportParent[] = [];
  private geoJsonData: any;
  private markersLayer = Leaflet.layerGroup();
  private map!: Leaflet.Map;
  private darkTile: Leaflet.Layer = Leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  });
  private lightTile: Leaflet.Layer = Leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  });

  constructor(private mapService: MapService, private reportsService: ReportsService, private sidebarService: SidebarService, private dialogService: DialogService, private themeService: ThemeService) {
    effect(() => {
      this.markersLayer.clearLayers();
      this.reports = this.reportsService.reportsSignal();
      this.geoJsonData = this.mapService.createGeoJson(this.reports);
      this.populateMap(this.geoJsonData);
    });

    effect(() => {
      this.markersLayer.clearLayers();
      this.reports = this.reportsService.filteredReportsSignal();
      this.geoJsonData = this.mapService.createGeoJson(this.reports);
      this.populateMap(this.geoJsonData);
    });

    effect(() => {
      if (this.themeService.colorModeSignal() === null) return;
      if (this.themeService.colorMode === COLORMODE.Dark) {
        this.map.removeLayer(this.lightTile)
        this.darkTile.addTo(this.map);
      } else {
        this.map.removeLayer(this.darkTile)
        this.lightTile.addTo(this.map);
      }
    });
  }

  ngOnInit(): void {
    this.initMap();
    this.darkTile.addTo(this.map);
    this.map.addLayer(this.markersLayer);
  }

  private initMap(): void {
    this.map = Leaflet.map('map', {
      zoomControl: false,
      attributionControl: false,
      maxZoom: 20,
      minZoom: 14
    }).setView([44.41361028797091, 8.844596073925151], 13);

    Leaflet.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);

    this.map.setMaxBounds(this.map.getBounds());

    this.map.on('click', () => this.sidebarService.isOpen.set(false));
  }

  private populateMap(geoJsonData: any): void {
    Leaflet.geoJSON(geoJsonData, {
      pointToLayer: (feature, latLng) => this.createMarker(feature, latLng).on('click', () => this.onMarkerClick(feature))
    }).addTo(this.markersLayer);
  }

  private createMarker(feature: GeoJSONFeature, latLng: Leaflet.LatLng): Leaflet.CircleMarker {
    const color: string = this.chooseMarkerColor(feature);
    let options = {
      stroke: true,
      radius: 8,
      weight: 2,
      color: color,
      opacity: 1,
      fillColor: color,
      fillOpacity: 0.5
    };

    return new Leaflet.CircleMarker(latLng, options);
  }

  private chooseMarkerColor(feature: GeoJSONFeature): string {
    let color: string;
    switch (feature.properties['report'].priority) {
      case 'high':
        color = 'red';
        break;

      case 'medium':
        color = 'orange';
        break;

      case 'low':
        color = 'green';
        break;

      default:
        color = 'grey';
        break;
    }
    return color;
  }

  private onMarkerClick(feature: any): void {
    let report: ReportParent = feature.properties.report;
    this.dialogService.report.set(report);
    this.dialogService.isOpen.set(true);
  }
}
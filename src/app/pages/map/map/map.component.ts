import { Component, Input, effect } from '@angular/core';
import * as Leaflet from 'leaflet';
import { GeoJSONFeature, MapService } from '../../../services/map.service';
import { SidebarService } from '../../../observables/sidebar.service';
import { ReportParent } from '../../../models/report-parent.model';
import { ReportsService } from '../../../services/reports.service';
import { DialogService } from '../../../observables/dialog.service';
import { ThemeService } from '../../../services/theme.service';
import { COLORMODE } from '../../../models/color-mode.model';
import { AdditionalLayersMenuService } from '../../../observables/additional-layers-menu.service';
import { AdditionalLayersService } from '../../../services/additional-layers.service';
import { AdditionalLayer } from '../../../models/additional-layer.model';
import { GeoPoint } from 'firebase/firestore';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent {
  public reports: ReportParent[] = [];
  public closedReports: ReportParent[] = [];
  private geoJsonData: any;

  private _initialPosition: { location: GeoPoint, zoom: number } = { location: new GeoPoint(0.0, 0.0), zoom: 13 };
  public get initialPosition(): { location: GeoPoint, zoom: number } {
    return this._initialPosition
  }
  @Input() public set initialPosition(value: { location: GeoPoint, zoom: number }) {
    if (!value) return;
    this._initialPosition = value;
    if (!this.map) return;
    this.map.setView([this.initialPosition.location.latitude, this.initialPosition.location.longitude], this.initialPosition.zoom);
  }

  private map!: Leaflet.Map;
  private markersLayer = Leaflet.layerGroup();
  private additionalLayers: Leaflet.LayerGroup = Leaflet.layerGroup();

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

  constructor(
    private mapService: MapService,
    private reportsService: ReportsService,
    private sidebarService: SidebarService,
    private additionalLayersService: AdditionalLayersService,
    private additionalLayersMenuService: AdditionalLayersMenuService,
    private dialogService: DialogService,
    private themeService: ThemeService
  ) {
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

    effect(() => {
      if (this.additionalLayersService.currentLayersSignal() === null) return;
      this.additionalLayers.clearLayers();    
      this.additionalLayersService.currentLayersSignal().forEach((layer: AdditionalLayer) => {
        Leaflet.geoJSON(layer.geoJson, {
          style: {
            fillColor: layer.style.fillColor,
            color: layer.style.strokeColor,
            weight: 1
          },
          onEachFeature: (feature, layer) => feature.properties.description ? layer.bindPopup(feature.properties.description) : ''
        }).addTo(this.additionalLayers).bringToBack();
      });
    });
  }

  ngOnInit(): void {
    this.initMap();
    this.darkTile.addTo(this.map);
    this.map.addLayer(this.additionalLayers);
    this.map.addLayer(this.markersLayer);
  }

  private initMap(): void {
    this.map = Leaflet.map('map', {
      zoomControl: false,
      attributionControl: false,
      // maxZoom: 20,
      // minZoom: 14
    }).setView([this.initialPosition.location.latitude, this.initialPosition.location.latitude], this.initialPosition.zoom);

    Leaflet.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);

    this.map.on('click', () => {
      this.sidebarService.isOpen.set(false);
      this.additionalLayersMenuService.isOpenSignal.set(false);
    });
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

    if (feature.properties['report'].closingChildId) {
      return color = 'blue';
    }

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
    this.dialogService.createDialog();
  }
}
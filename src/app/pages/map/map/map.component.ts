import { Component, Input, effect } from '@angular/core';
import * as Leaflet from 'leaflet';
import { GeoJSONFeature, MapService } from '../../../services/map.service';
import { SidebarService } from '../../../observables/sidebar.service';
import { ReportParent } from '../../../models/report-parent.model';
import { DialogService } from '../../../observables/dialog.service';
import { ThemeService } from '../../../services/theme.service';
import { COLORMODE } from '../../../models/color-mode.model';
import { AdditionalLayersMenuService } from '../../../observables/additional-layers-menu.service';
import { AdditionalLayersService } from '../../../services/additional-layers.service';
import { AdditionalLayer } from '../../../models/additional-layer.model';
import { GeoPoint } from 'firebase/firestore';
import { VERTICAL } from '../../../models/vertical.model';
import { StatusDetail } from '../../../models/priority.model';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent {
  private _reports: ReportParent[] = [];
  public get reports(): ReportParent[] {
    return this._reports;
  }
  @Input() public set reports(value: ReportParent[]) {
    if (!value) return;
    this._reports = value;

    this.markersLayer.clearLayers();
    this.closedReportLayer.clearLayers();

    const normalReports: ReportParent[] = this.reports.filter((report: ReportParent) => !report.closingChildId);
    const closedReports: ReportParent[] = this.reports.filter((report: ReportParent) => report.closingChildId);

    const normalGeoJsonData: any = this.mapService.createGeoJson(normalReports);
    const closedGeoJsonData: any = this.mapService.createGeoJson(closedReports);

    this.populateMap(normalGeoJsonData, this.markersLayer);
    this.populateMap(closedGeoJsonData, this.closedReportLayer);
  }

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

  private _currentApp: VERTICAL | null = null;
  @Input() public set currentApp(value: VERTICAL | null) {
    if (!value) return;
    this._currentApp = value;
  }
  public get currentApp(): VERTICAL | null {
    return this._currentApp;
  }

  private _labels: { [key: string]: StatusDetail } = {};
  public get labels(): { [key: string]: StatusDetail } {
    return this._labels;
  }
  @Input() public set labels(labels: { [key: string]: StatusDetail }) {
    this._labels = labels;
    console.log(this.labels);
  }

  private map!: Leaflet.Map;
  private markersLayer: Leaflet.LayerGroup = Leaflet.layerGroup();
  private closedReportLayer: Leaflet.LayerGroup = Leaflet.layerGroup();
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
    private sidebarService: SidebarService,
    private additionalLayersService: AdditionalLayersService,
    private additionalLayersMenuService: AdditionalLayersMenuService,
    private dialogService: DialogService,
    private themeService: ThemeService
  ) {
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
          style: (feature) => ({
            fillColor: layer.style.fillColor,
            color: layer.style.strokeColor,
            weight: 1
          }),
          pointToLayer: (feature, latLng) => {
            return Leaflet.circleMarker(latLng, {
              stroke: true,
              radius: 8,
              weight: 1,
              color: layer.style.strokeColor,
              opacity: 1,
              fillColor: layer.style.fillColor,
              fillOpacity: 0.5
            });
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
    this.map.addLayer(this.closedReportLayer);
  }

  private initMap(): void {
    this.map = Leaflet.map('map', {
      zoomControl: false,
      attributionControl: false,
    }).setView([this.initialPosition.location.latitude, this.initialPosition.location.latitude], this.initialPosition.zoom);

    Leaflet.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);

    this.map.on('click', () => {
      this.sidebarService.isOpen.set(false);
      this.additionalLayersMenuService.isOpenSignal.set(false);
    });
  }

  private populateMap(geoJsonData: any, layerGroup: Leaflet.LayerGroup): void {
    Leaflet.geoJSON(geoJsonData, {
      pointToLayer: (feature, latLng) => this.createMarker(feature, latLng).on('click', () => this.onMarkerClick(feature))
    }).addTo(layerGroup);
  }

  private createMarker(feature: GeoJSONFeature, latLng: Leaflet.LatLng): Leaflet.CircleMarker {
    const color: string = this.chooseMarkerColor(feature);
    let options = {
      stroke: true,
      radius: 8,
      weight: 1,
      color: 'white',
      opacity: 1,
      fillColor: color,
      fillOpacity: 0.5
    };

    return new Leaflet.CircleMarker(latLng, options);
  }

  private chooseMarkerColor(feature: GeoJSONFeature): string {
    let color: string = 'grey';

    if (feature.properties['report'].closingChildId) {
      return color = 'blue';
    }

    for (const key in this.labels) {
      if (Object.prototype.hasOwnProperty.call(this.labels, key)) {
        if (key === feature.properties['report'].priority) color = this.labels[key].color;
      }
    }
    return color;
  }

  private onMarkerClick(feature: any): void {
    if (feature.properties.report.verticalId !== this.currentApp) return;

    let report: ReportParent = feature.properties.report;
    this.dialogService.report.set(report);
    this.dialogService.createDialog();
  }
}
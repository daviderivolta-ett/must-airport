import { Component, Input, effect } from '@angular/core';
import { GeoPoint } from 'firebase/firestore';
import * as Leaflet from 'leaflet';
import { PRIORITY } from '../../models/priority.model';
import { MiniMapData } from '../../services/map.service';
import { ThemeService } from '../../services/theme.service';
import { COLORMODE } from '../../models/color-mode.model';

@Component({
  selector: 'app-mini-map',
  standalone: true,
  imports: [],
  templateUrl: './mini-map.component.html',
  styleUrl: './mini-map.component.scss'
})
export class MiniMapComponent {
  private map!: Leaflet.Map;
  private marker: Leaflet.CircleMarker | null = null;
  public mapId: string = this.generateMiniMapUniqueId();

  private _miniMapData: MiniMapData = { location: new GeoPoint(0.0, 0.0), priority: PRIORITY.NotAssigned };

  @Input() public set miniMapData(value: MiniMapData) {
    if (value) {
      this._miniMapData = value;
    }
    if (this.map) {
      this.createMarker(new Leaflet.LatLng(this._miniMapData.location.latitude, this._miniMapData.location.longitude), this._miniMapData.priority);
    }
  }

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

  constructor(private themeService: ThemeService) {
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

  public ngAfterViewInit(): void {   
    this.initMap();
    this.darkTile.addTo(this.map);
    this.createMarker(new Leaflet.LatLng(this._miniMapData.location.latitude, this._miniMapData.location.longitude), this._miniMapData.priority);
  }

  private initMap(): void {
    this.map = Leaflet.map(this.mapId, {
      zoomControl: false,
      attributionControl: false,
      maxZoom: 13,
      minZoom: 13,
      dragging: false
    }).setView([this._miniMapData.location.latitude, this._miniMapData.location.longitude], 13);

    // Leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    //   subdomains: 'abcd',
    //   maxZoom: 20
    // }).addTo(this.map);

    // this.map.setMaxBounds(this.map.getBounds());
  }

  private createMarker(latLng: Leaflet.LatLng, priority: PRIORITY): void {
    if (this.marker) this.marker.removeFrom(this.map);
    const color: string = this.choosemarkerColor(priority);
    let options: Leaflet.CircleMarkerOptions = {
      stroke: true,
      radius: 8,
      weight: 2,
      color: color,
      opacity: 1,
      fillColor: color,
      fillOpacity: 0.5
    };

    this.marker = new Leaflet.CircleMarker(latLng, options).addTo(this.map);
  }

  private choosemarkerColor(priority: PRIORITY): string {
    let color: string;
    switch (priority) {
      case PRIORITY.High:
        color = 'red';
        break;

      case PRIORITY.Medium:
        color = 'orange';
        break;

      case PRIORITY.Low:
        color = 'green';
        break;

      default:
        color = 'grey';
        break;
    }
    return color;
  }

  private generateMiniMapUniqueId(): string {
    const alphabet: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let isLowerCase: boolean = false;

    let id: string = '';

    for (let i = 0; i <= 9; i++) {
      Math.floor(Math.random() * 10) % 2 === 0 ? isLowerCase = true : isLowerCase = false;
      let randomLetter: string;
      isLowerCase === true ? randomLetter = this.pickRandomLetter(alphabet).toLocaleLowerCase() : randomLetter = this.pickRandomLetter(alphabet);
      let randomNum = Math.floor(Math.random() * 10);
      id = id + randomLetter + randomNum;
    }
    return id;
  }

  private pickRandomLetter(str: string): string {
    return str[Math.floor(Math.random() * (str.length - 1))];
  }
}
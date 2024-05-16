import * as Leaflet from 'leaflet';
import { Injectable } from '@angular/core';
import { ReportParent } from '../models/report-parent.model';
import { GeoPoint } from 'firebase/firestore';
import { PRIORITY } from '../models/priority.model';

export interface Geometry {
  type: string;
  coordinates: number[];
}

export interface FeatureProperties {
  [key: string]: any;
}

export interface GeoJSONFeature {
  type: string;
  geometry: Geometry;
  properties: FeatureProperties;
}

export interface GeoJsonData {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

export interface MiniMapData {
  location: GeoPoint,
  priority: PRIORITY
}

@Injectable({
  providedIn: 'root'
})
export class MapService {
  constructor() { }

  public createGeoJson(reports: ReportParent[]): GeoJsonData {
    const geoJSON: GeoJsonData = {
      type: 'FeatureCollection',
      features: reports.map(report => ({
        type: "Feature",
        properties: {
          report: report
        },
        geometry: {
          coordinates: [report.location.longitude, report.location.latitude],
          type: "Point"
        }
      }))
    };

    return geoJSON;
  }

  public createMarker(feature: GeoJSONFeature, latLng: Leaflet.LatLng): Leaflet.CircleMarker {
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
}
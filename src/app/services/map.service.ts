import { Injectable } from '@angular/core';
import { ReportParent } from '../models/report-parent.model';

export interface Geometry {
  type: string;
  coordinates: number[];
}

export interface FeatureProperties {
  [key: string]: any;
}

export interface GeoJSONFeature {
  type: "Feature";
  geometry: Geometry;
  properties: FeatureProperties;
}

export interface GeoJsonData {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
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
}
import { Injectable } from '@angular/core';
import { ReportParent } from '../models/report-parent.model';

interface GeoJsonData {
  type: string;
  features: any[];
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
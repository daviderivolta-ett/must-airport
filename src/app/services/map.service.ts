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
    const features = reports.map(report => ({
      type: "Feature",
      properties: report,
      geometry: {
        coordinates: [report.location.longitude, report.location.latitude],
        type: "Point"
      }
    }));

    const geoJSON: GeoJsonData = {
      type: 'FeatureCollection',
      features: features
    }

    return geoJSON;
  }

  private parseProperties(report: ReportParent): { [key: string]: any } {
    const properties: { [key: string]: any } = {};

    for (const key in report) {
      if (key !== 'location') {
        properties[key] = report[key];
      }
    }

    return properties;
  }
}

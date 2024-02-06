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

  public createGeoJson(failures: ReportParent[]): GeoJsonData {
    const features = failures.map(failure => ({
      type: "Feature",
      properties: this.parseProperties(failure),
      geometry: {
        coordinates: [failure.location.longitude, failure.location.latitude],
        type: "Point"
      }
    }));

    const geoJSON: GeoJsonData = {
      type: 'FeatureCollection',
      features: features
    }

    return geoJSON;
  }

  private parseProperties(failure: ReportParent): { [key: string]: any } {
    const properties: { [key: string]: any } = {};

    for (const key in failure) {
      if (key !== 'location') {
        properties[key] = failure[key];
      }
    }

    return properties;
  }
}

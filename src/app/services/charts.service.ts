import { Injectable } from '@angular/core';
import { ReportParent } from '../models/report-parent.model';
import { Timestamp } from 'firebase/firestore';

export type chartData = [number, number];

@Injectable({
  providedIn: 'root'
})
export class ChartsService {

  constructor() { }

  public createReportsNumPerTimeSerie(reports: ReportParent[]): any {
    let dates: Date[];
    dates = reports.map(report => report.creationTime);

    let dateFrequency: { [key: string]: number } = {};
    dates.forEach(date => {
      const dateString = date.toISOString().split('T')[0];
      dateFrequency[dateString] = (dateFrequency[dateString] || 0) + 1;
    });

    let serie: [number, number][] = Object.entries(dateFrequency).map(([dateString, count]) => [new Date(dateString).getTime(), count]);
    return serie;
  }
}
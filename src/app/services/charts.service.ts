import { Injectable, WritableSignal, effect, signal } from '@angular/core';
import { ReportParent } from '../models/report-parent.model';
import { PRIORITY } from '../models/priority.model';

export type timeChartData = [number, number];
export interface pieChartData {
  name: string,
  y: number
}

@Injectable({
  providedIn: 'root'
})
export class ChartsService {
  public reportNumPerTimeSerieSignal: WritableSignal<[number, number][]> = signal([]);
  public reportNumPerTimeSerie: timeChartData[] = [];

  constructor() {
    effect(() => this.reportNumPerTimeSerie = this.reportNumPerTimeSerieSignal());
  }

  public createReportsNumPerTimeSerie(reports: ReportParent[]): timeChartData[] {
    let dates: Date[];
    dates = reports.map(report => report.creationTime);

    let dateFrequency: { [key: string]: number } = {};
    dates.forEach(date => {
      const dateString = date.toISOString().split('T')[0];
      dateFrequency[dateString] = (dateFrequency[dateString] || 0) + 1;
    });

    let serie: [number, number][] = Object.entries(dateFrequency).map(([dateString, count]) => [new Date(dateString).getTime(), count]);
    serie.sort((a, b) => a[0] - b[0]);
    return serie;
  }

  public createReportsNumPerPrioritySerie(reports: ReportParent[]): pieChartData[] {
    let serie: pieChartData[] = [];
    let priorities: PRIORITY[];
    priorities = reports.map(report => report.priority);

    let priorityFrequencyRaw: { [key: string]: number } = {};
    priorities.forEach(priority => {
      priorityFrequencyRaw[priority] = (priorityFrequencyRaw[priority] || 0) + 1;
    });

    serie = Object.entries(priorityFrequencyRaw).map(([name, value]): pieChartData => ({
      name: name,
      y: value
    }));

    const nameMapping: Record<string, string> = {
      "": "Non validate",
      "low": "Bassa",
      "medium": "Media",
      "high": "Alta"
    }

    serie.forEach(item => {
      item.name = nameMapping[item.name] || item.name;
    });

    console.log(serie);    
    return serie;
  }
}
import { Injectable, WritableSignal, effect, signal } from '@angular/core';
import { ReportParent } from '../models/report-parent.model';
import { PRIORITY } from '../models/priority.model';
import { OPERATIONTYPE, Operation } from '../models/operation.model';

export type timeChartData = [number, number];
export interface pieChartData {
  name: string,
  y: number,
  color: string
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

  public createReportsNumPerTimeSerie(reports: ReportParent[]): Highcharts.SeriesLineOptions {
    let dates: Date[];
    dates = reports.map(report => report.creationTime);

    let dateFrequency: { [key: string]: number } = {};
    dates.forEach(date => {
      const dateString = date.toISOString().split('T')[0];
      dateFrequency[dateString] = (dateFrequency[dateString] || 0) + 1;
    });

    let data: [number, number][] = Object.entries(dateFrequency).map(([dateString, count]) => [new Date(dateString).getTime(), count]);
    data.sort((a, b) => a[0] - b[0]);

    let serie: Highcharts.SeriesOptionsType = {
      type: 'line',
      data: data,
      name: 'Segnalazioni ricevute',
      color: 'rgb(163, 113, 247)',
    }

    return serie;
  }

  public createInterventionsPerTimeSerie(reports: ReportParent[]): Highcharts.SeriesLineOptions {
    const operations: Operation[] = reports.flatMap(report => report.operations);
    const interventions: Operation[] = operations.filter(operation => operation.type === OPERATIONTYPE.Intervention);
    const interventionFrequency = this.calculateDateFrequency(interventions);
    let interventionsSerieData: [number, number][] = Object.entries(interventionFrequency).map(([dateString, count]) => [new Date(dateString).getTime(), count]);
    interventionsSerieData.sort((a, b) => a[0] - b[0]);

    let interventionsSerie: Highcharts.SeriesLineOptions = {
      type: 'line',
      data: interventionsSerieData,
      name: 'Interventi',
      color: 'rgb(31, 111, 235)'
    }
    return interventionsSerie;
  }

  public createInspectionsPerTimeSerie(reports: ReportParent[]): Highcharts.SeriesLineOptions {
    const operations: Operation[] = reports.flatMap(report => report.operations);
    const inspections: Operation[] = operations.filter(operation => operation.type === OPERATIONTYPE.Inspection);
    const inspectionFrequency = this.calculateDateFrequency(inspections);
    let inspectionsSerieData: [number, number][] = Object.entries(inspectionFrequency).map(([dateString, count]) => [new Date(dateString).getTime(), count]);
    inspectionsSerieData.sort((a, b) => a[0] - b[0]);

    let inspectionsSerie: Highcharts.SeriesLineOptions = {
      type: 'line',
      data: inspectionsSerieData,
      name: 'Ispezioni',
      color: 'rgb(35, 134, 54)'
    }
    return inspectionsSerie;
  }

  private calculateDateFrequency(operations: Operation[]): { [key: string]: number } {
    const dates: Date[] = operations.map(operation => operation.date);

    const dateFrequency: { [key: string]: number } = {};
    dates.forEach(date => {
      const dateString = date.toISOString().split('T')[0];
      dateFrequency[dateString] = (dateFrequency[dateString] || 0) + 1;
    });
    return dateFrequency;
  }

  public createReportsNumPerPrioritySerie(reports: ReportParent[]): Highcharts.SeriesPieOptions {
    let data: pieChartData[] = [];
    let priorities: PRIORITY[];
    priorities = reports.map(report => report.priority);

    let priorityFrequencyRaw: { [key: string]: number } = {};
    priorities.forEach(priority => {
      priorityFrequencyRaw[priority] = (priorityFrequencyRaw[priority] || 0) + 1;
    });

    const colorMapping: Record<string, string> = {
      '': 'grey',
      'low': 'green',
      'medium': 'orange',
      'high': 'red'
    }

    data = Object.entries(priorityFrequencyRaw).map(([name, value]): pieChartData => ({
      name: name,
      y: value,
      color: colorMapping[name]
    }));

    const nameMapping: Record<string, string> = {
      "": "Non validate",
      "low": "Bassa",
      "medium": "Media",
      "high": "Alta"
    }

    data.forEach(item => {
      item.name = nameMapping[item.name] || item.name;
    });

    let serie: Highcharts.SeriesPieOptions = {
      type: 'pie',
      data: data,
      name: 'Segnalazioni per priorità'
    }

    return serie;
  }
}
import { Injectable, WritableSignal, effect, signal } from '@angular/core';
import { ReportParent } from '../models/report-parent.model';
import { PRIORITY } from '../models/priority.model';
import { OPERATIONTYPE, Operation } from '../models/operation.model';
import { TechElementTag } from '../models/tech-element-tag.model';
import { TechElementSubTag } from '../models/tech-element-subtag.model';
import { FailureTag } from '../models/failure-tag.model';
import { ReportChild } from '../models/report-child.model';
import { SeriesPieOptions } from 'highcharts';
import { FailureSubTag } from '../models/failure-subtag.model';

export type timeChartData = [number, number];
export interface pieChartData {
  name: string,
  y: number,
  color?: string,
  drilldown?: string
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
      marker: {
        enabled: true,
        radius: 4
      }
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
      color: 'rgb(31, 111, 235)',
      marker: {
        enabled: true,
        radius: 4
      }
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
      color: 'rgb(35, 134, 54)',
      marker: {
        enabled: true,
        radius: 4
      }
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

  public createTechElementTagsNumSerie(reports: ReportParent[]): Highcharts.SeriesPieOptions {
    let techElementTags: TechElementTag[] = [];
    let idFrequency: { [key: string]: number } = {};
    let data: pieChartData[] = [];

    techElementTags = reports.flatMap(report =>
      report.fields.tagTechElement
        .filter(tag => typeof tag !== 'string')
        .map(tag => tag as TechElementTag)
    );

    techElementTags.forEach(tag => {
      const id = tag.id;
      idFrequency[id] = (idFrequency[id] || 0) + 1;
    });

    data = Object.entries(idFrequency).map(([name, value]): pieChartData => ({
      name: ((techElementTags.find(tag => tag.id === name))?.name.it || name) as string,
      y: value,
      drilldown: name
    }));

    let serie: Highcharts.SeriesPieOptions = {
      type: 'pie',
      name: 'Elementi tecnici',
      data: data,
    }
    return serie;
  }

  public createFailureSubTagsDrilldownNumSeries(reports: ReportChild[], failureTagsNumSerie: Highcharts.SeriesPieOptions): Highcharts.SeriesPieOptions[] {
    let failureSubTags: FailureSubTag[] = [];
    let series: Highcharts.SeriesPieOptions[] = [];

    failureSubTags = reports.flatMap(report => {
      return report.fields.subTagFailure
        .filter(tag => typeof tag !== 'string')
        .map(tag => tag as FailureSubTag)
    });
   
    if (failureTagsNumSerie.data) {
      failureTagsNumSerie.data.map((item: any) => {
        let failureSubTagsPerFailureTag: FailureSubTag[] = failureSubTags.filter(subTag => subTag.id.includes(item.drilldown));

        if (failureSubTagsPerFailureTag.length === 0) return;
        
        let idFrequency: { [key: string]: number } = {};
        failureSubTagsPerFailureTag.forEach(tag => {
          const id = tag.id;
          idFrequency[id] = (idFrequency[id] || 0) + 1;
        });

        let data: pieChartData[] = [];
        data = Object.entries(idFrequency).map(([name, value]): pieChartData => ({
          name: ((failureSubTagsPerFailureTag.find(tag => tag.id === name))?.name.it || name) as string,
          y: value
        }));

        const serie: Highcharts.SeriesPieOptions = {
          id: item.drilldown,
          data: data,
          type: 'pie'
        }

        series.push(serie);
      });
    }

    return series;
  }

  public createTechElementSubTagsDrilldownNumSeries(reports: ReportParent[], techElementTagsNumSerie: Highcharts.SeriesPieOptions): Highcharts.SeriesPieOptions[] {
    let techElementSubtags: TechElementSubTag[] = [];
    let series: Highcharts.SeriesPieOptions[] = [];

    techElementSubtags = reports.flatMap(report => {
      return report.fields.subTagTechElement
        .filter(tag => typeof tag !== 'string')
        .map(tag => tag as TechElementSubTag)
    });

    if (techElementTagsNumSerie.data) {
      techElementTagsNumSerie.data.map((item: any) => {
        let techElementSubtagsPerTechElementTag: TechElementSubTag[] = techElementSubtags.filter(subTag => subTag.id.includes(item.drilldown));

        let idFrequency: { [key: string]: number } = {};
        techElementSubtagsPerTechElementTag.forEach(tag => {
          const id = tag.id;
          idFrequency[id] = (idFrequency[id] || 0) + 1;
        });

        let data: pieChartData[] = [];
        data = Object.entries(idFrequency).map(([name, value]): pieChartData => ({
          name: ((techElementSubtagsPerTechElementTag.find(tag => tag.id === name))?.name.it || name) as string,
          y: value
        }));

        const serie: Highcharts.SeriesPieOptions = {
          id: item.drilldown,
          data: data,
          type: 'pie'
        }
        series.push(serie);
      });
    }
    return series;
  }

  public createFailureTagsNumSerie(reports: ReportChild[]): Highcharts.SeriesPieOptions {
    // console.log(reports);    
    let failureTags: FailureTag[] = [];
    let idFrequency: { [key: string]: number } = {};
    let data: pieChartData[] = [];

    failureTags = reports.flatMap(report => {
      return report.fields.tagFailure
        .filter(tag => typeof tag !== 'string')
        .map(tag => tag as FailureTag)
    });

    failureTags.forEach(tag => {
      const id = tag.id;
      idFrequency[id] = (idFrequency[id] || 0) + 1;
    });

    data = Object.entries(idFrequency).map(([name, value]): pieChartData => ({
      name: ((failureTags.find(tag => tag.id === name))?.name.it || name) as string,
      y: value,
      drilldown: name
    }));

    let serie: SeriesPieOptions = {
      type: 'pie',
      name: 'Segnali di guasto',
      data: data
    }
    return serie;
  }

  public generateChartUniqueId(): string {
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
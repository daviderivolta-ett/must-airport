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
import { ConfigService } from './config.service';
import { WebAppConfigTagType, WebAppConfigTags } from '../models/config.model';
import { Tag, TagGroup } from '../models/tag.model';

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
  public reportNumPerTimeSerie: timeChartData[] = [];

  constructor(private configService: ConfigService) { }

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
    const interventions: Operation[] = operations.filter(operation => operation.type === OPERATIONTYPE.Maintenance);
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
    const inspections: Operation[] = operations.filter(operation => operation.type === OPERATIONTYPE.InspectionHorizontal || operation.type === OPERATIONTYPE.InspectionVertical);
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

  public createTagsSerie(configTagType: WebAppConfigTagType, reports: ReportParent[] | ReportChild[]): { series: Highcharts.SeriesPieOptions[], drilldownSeries: Highcharts.SeriesPieOptions[] } {
    let series: Highcharts.SeriesPieOptions[] = [];
    let drilldownSeries: Highcharts.SeriesPieOptions[] = [];

    configTagType.groups.forEach((group: TagGroup) => {
      const serie: Highcharts.SeriesPieOptions = {
        type: 'pie',
        name: group.id,
        data: [],
        id: group.id
      }

      configTagType.elements.forEach((tag: Tag) => {
        if (tag.type === group.id) {
          let d: Highcharts.PointOptionsObject = {
            name: tag.id,
            drilldown: tag.id,
            y: 0,
            id: tag.id
          }

          if (serie.data) serie.data.push(d);

          if (group.subGroup) {
            if (tag.subTags) {
              const drilldownSerie: Highcharts.SeriesPieOptions[] = this.createTagsDrilldownSerie(group.subGroup, d.drilldown ? d.drilldown : '', tag.subTags, drilldownSeries);
              drilldownSeries.concat(drilldownSerie);
            }
          }
        }
      });

      series.push(serie);
    });


    const tags: { [key: string]: string[] } = this.getReportTags(reports, configTagType.groups);
    const frequencies: { [key: string]: { [key: string]: number } } = this.calculateTagsFrequency(tags);
    series = this.fillSeriesData(series, frequencies);

    const drilldownGroups: TagGroup[] = configTagType.groups.map(group => group.subGroup).filter((subGroup): subGroup is TagGroup => subGroup !== null);
    const drilldownTags: { [key: string]: string[] } = this.getReportTags(reports, drilldownGroups);
    const drilldownFrequencies: { [key: string]: { [key: string]: number } } = this.calculateTagsFrequency(drilldownTags);
    drilldownSeries = this.fillSeriesData(drilldownSeries, drilldownFrequencies);

    return { series, drilldownSeries };
  }

  private createTagsDrilldownSerie(group: TagGroup, drilldownId: string, tags: Tag[], series: Highcharts.SeriesPieOptions[]) {
    const serie: Highcharts.SeriesPieOptions = {
      type: 'pie',
      name: group.id,
      id: drilldownId,
      data: [],
    }

    tags.forEach((tag: Tag) => {
      if (tag.type === group.id) {
        let d: Highcharts.PointOptionsObject = {
          name: tag.id,
          drilldown: tag.id,
          y: 0,
          id: tag.id
        }
        if (serie.data) serie.data.push(d);

        if (group.subGroup) {
          if (tag.subTags) {
            this.createTagsDrilldownSerie(group.subGroup, d.drilldown ? d.drilldown : '', tag.subTags, series);
          }
        }
      }
    });

    series.push(serie);

    return series;
  }

  private getReportTags(reports: ReportParent[] | ReportChild[], tagGroups: TagGroup[]): { [key: string]: string[] } {
    let tags: { [key: string]: string[] } = {};

    tagGroups.forEach((group: TagGroup) => {
      reports.forEach((report: ReportParent | ReportChild) => {
        for (const key in report.fields) {
          if (Object.prototype.hasOwnProperty.call(report.fields, key)) {
            if (key === group.id) {
              if (!tags[key]) {
                tags[key] = [];
              }
              tags[key] = tags[key].concat(report.fields[key]);
            }
          }
        }
      });
    });
    // tags = this.getTagNames(tags, this.configService.tags);
    console.log('Tags', tags);
    return tags;
  }

  private getTagNames(foundTags: { [key: string]: string[] }, configTags: Tag[]) {
    const result: { [key: string]: string[] } = {};

    for (const key in foundTags) {
      if (Object.prototype.hasOwnProperty.call(foundTags, key)) {
        let tags: string[] = foundTags[key];

        tags = tags.map((t: string) => {
          const configTag: Tag | undefined = configTags.find((tag: Tag) => tag.id === t);
          return configTag ? configTag.name : t;
        });

        result[key] = tags;
      }
    }

    return result;
  }

  private calculateTagsFrequency(tags: { [key: string]: string[] }): { [key: string]: { [key: string]: number } } {
    const frequencies: { [key: string]: { [key: string]: number } } = {};

    for (const key in tags) {
      if (Object.prototype.hasOwnProperty.call(tags, key)) {

        frequencies[key] = tags[key].reduce((acc, curr) => {
          acc[curr] = (acc[curr] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });

      }
    }
    console.log('Frequencies', frequencies);
    return frequencies;
  }

  private fillSeriesData(series: Highcharts.SeriesPieOptions[], frequencies: { [key: string]: { [key: string]: number } }): Highcharts.SeriesPieOptions[] {
    series = series.map((serie: Highcharts.SeriesPieOptions) => {
      if (serie.name && frequencies.hasOwnProperty(serie.name)) {
        const frequencyData: { [key: string]: number } = frequencies[serie.name];
        serie.data = (serie.data as Highcharts.PointOptionsObject[]).map((d: Highcharts.PointOptionsObject) => {
          if (d.name && frequencyData.hasOwnProperty(d.name)) {
            d.y = frequencyData[d.name];
          }
          return d;
        });
      }
      return serie;
    });

    series = this.removeEmptyData(series);
    console.log('Series', series);

    return series;
  }

  private removeEmptyData(series: Highcharts.SeriesPieOptions[]) {
    series = series.map((serie: Highcharts.SeriesPieOptions) => {
      serie.data = (serie.data as Highcharts.PointOptionsObject[]).filter((d: Highcharts.PointOptionsObject) => d.y !== 0);
      return serie;
    });

    return series.filter((serie: Highcharts.SeriesPieOptions) => (serie.data as Highcharts.PointOptionsObject[]).length > 0);
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
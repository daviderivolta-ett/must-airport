import { Injectable } from '@angular/core';
import { ReportParent } from '../models/report-parent.model';
import { PRIORITY } from '../models/priority.model';
import { Inspection, OPERATIONTYPE, Operation } from '../models/operation.model';
import { ReportChild } from '../models/report-child.model';
import { WebAppConfigTagType } from '../models/config.model';
import { Tag, TagGroup } from '../models/tag.model';

export type timeChartData = [number, number];
export interface pieChartData {
  name: string,
  y: number,
  color?: string,
  drilldown?: string
}

interface CustomSeriesPieOptions extends Highcharts.SeriesPieOptions {
  uuid: string;
}

interface CustomPointOptionsObject extends Highcharts.PointOptionsObject {
  uuid: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChartsService {
  public reportNumPerTimeSerie: timeChartData[] = [];

  constructor() { }

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

  public createInterventionsPerTimeSerie(operations: Inspection[]): Highcharts.SeriesLineOptions {
    const interventions: Inspection[] = operations.filter(operation => operation.type === OPERATIONTYPE.Maintenance);
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

  public createInspectionsPerTimeSerie(operations: Inspection[]): Highcharts.SeriesLineOptions {
    const inspections: Inspection[] = operations.filter(operation =>
      operation.type === OPERATIONTYPE.InspectionHorizontal ||
      operation.type === OPERATIONTYPE.InspectionVertical ||
      operation.type === OPERATIONTYPE.Inspection);
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

  private calculateDateFrequency(operations: Inspection[]): { [key: string]: number } {
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
    let series: CustomSeriesPieOptions[] = [];
    let drilldownSeries: CustomSeriesPieOptions[] = [];

    configTagType.groups.forEach((group: TagGroup) => {
      const serie: CustomSeriesPieOptions = {
        type: 'pie',
        name: group.name,
        data: [],
        id: group.id,
        uuid: group.id
      }

      configTagType.elements.forEach((tag: Tag) => {
        if (tag.type === group.id) {
          let d: CustomPointOptionsObject = {
            name: tag.name,
            drilldown: tag.id,
            y: 0,
            id: tag.id,
            uuid: tag.id
          }

          if (serie.data) serie.data.push(d);

          if (group.subGroup) {
            if (tag.subTags) {
              const drilldownSerie: CustomSeriesPieOptions[] = this.createTagsDrilldownSerie(group.subGroup, d.drilldown ? d.drilldown : '', tag.subTags, drilldownSeries);
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

  private createTagsDrilldownSerie(group: TagGroup, drilldownId: string, tags: Tag[], series: CustomSeriesPieOptions[]) {
    const serie: CustomSeriesPieOptions = {
      type: 'pie',
      name: group.name,
      id: drilldownId,
      data: [],
      uuid: group.id
    }

    tags.forEach((tag: Tag) => {
      if (tag.type === group.id) {
        let d: CustomPointOptionsObject = {
          name: tag.name,
          drilldown: tag.id,
          y: 0,
          id: tag.id,
          uuid: tag.id
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
    // console.log('Tags', tags);
    return tags;
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
    // console.log('Frequencies', frequencies);
    return frequencies;
  }

  private fillSeriesData(series: CustomSeriesPieOptions[], frequencies: { [key: string]: { [key: string]: number } }): CustomSeriesPieOptions[] {
    series = series.map((serie: CustomSeriesPieOptions) => {
      if (serie.uuid && frequencies.hasOwnProperty(serie.uuid)) {
        const frequencyData: { [key: string]: number } = frequencies[serie.uuid];
        serie.data = (serie.data as CustomPointOptionsObject[]).map((d: CustomPointOptionsObject) => {
          if (d.uuid && frequencyData.hasOwnProperty(d.uuid)) {
            d.y = frequencyData[d.uuid];
          }
          return d;
        });
      }
      return serie;
    });

    series = this.removeEmptyData(series);
    // console.log('Series', series);
    return series;
  }

  private removeEmptyData(series: CustomSeriesPieOptions[]) {
    series = series.map((serie: CustomSeriesPieOptions) => {
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
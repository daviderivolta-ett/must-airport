import { Component, Input } from '@angular/core';
import * as Highstock from 'highcharts/highstock';
import { ChartsService, timeChartData } from '../../../services/charts.service';

@Component({
  selector: 'app-time-chart',
  standalone: true,
  imports: [],
  templateUrl: './time-chart.component.html',
  styleUrl: './time-chart.component.scss'
})
export class TimeChartComponent {
  @Input() public firstSerie: Highcharts.SeriesLineOptions = { type: 'line' };
  @Input() public secondSerie: Highstock.SeriesLineOptions | null = null;

  public charts!: Highcharts.Chart;
  public chartId: string = this.chartsService.generateChartUniqueId();

  public chartOptions: Highstock.Options = {
    series: [],
    chart: {
      backgroundColor: 'transparent',
      height: '300px'
    },
    xAxis: {
      lineColor: 'rgb(230, 237, 243)',
      labels: {
        style: {
          color: 'rgb(230, 237, 243)'
        }
      }
    },
    yAxis: {
      gridLineColor: 'rgb(39, 45, 52)'
    },
    credits: {
      enabled: false,
    },
    accessibility: {
      enabled: false
    },
    legend: {
      enabled: true,
      itemStyle: {
        color: 'rgb(230, 237, 243)'
      },
      itemHoverStyle: {
        color: 'rgb(125, 133, 144)'
      }
    },
    navigator: {
      enabled: false
    },
    scrollbar: {
      enabled: false
    },
    rangeSelector: {
      enabled: true,
      buttonTheme: {
        fill: 'transparent',
        style: {
          color: 'rgb(230, 237, 243)'
        },
        states: {
          select: {
            fill: 'transparent',
            style: {
              color: 'rgb(47, 129, 247)',
              fontWeight: 'regular'
            }
          },
          hover: {
            fill: 'transparent'
          },
          disabled: {
            style: {
              color: 'rgb(125, 133, 144)'
            }
          }
        }
      },
      buttons: [
        {
          type: 'month',
          count: 1,
          text: '1m'
        },
        {
          type: 'month',
          count: 3,
          text: '3m'
        },
        {
          type: 'month',
          count: 6,
          text: '6m'
        },
        {
          type: 'ytd',
          text: new Date().getFullYear().toString()
        },
        {
          type: 'year',
          count: 1,
          text: '1a'
        },
        {
          type: 'all',
          text: 'tutto'
        }
      ]
    }
  }

  constructor(private chartsService: ChartsService) { }

  public ngAfterViewInit(): void {
      this.initChart();
  }

  private initChart(): void {
    this.chartOptions.series?.push(this.firstSerie);
    if (this.secondSerie) this.chartOptions.series?.push(this.secondSerie);
    this.charts = Highstock.stockChart(`${this.chartId}`, this.chartOptions);
  }
}
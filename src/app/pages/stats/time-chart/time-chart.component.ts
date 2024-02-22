import { Component } from '@angular/core';
import * as Highcharts from 'highcharts';
import * as Highstock from 'highcharts/highstock';

@Component({
  selector: 'app-time-chart',
  standalone: true,
  imports: [],
  templateUrl: './time-chart.component.html',
  styleUrl: './time-chart.component.scss'
})
export class TimeChartComponent {
  public Highcharts: typeof Highcharts = Highcharts;
  public charts: any;
  public data = [[1645540200000, 1], [1658151000000, 2], [1668522600000, 3], [1686231000000, 4]];
  public data2 = [[1679059800000, 4], [1680096600000, 0], [1682602200000, 1], [1684762200000, 3]];
  // public data2 = [5, 6, 7, 8, 6]
  public chartOptions: Highcharts.Options = {
    series: [
      {
        type: 'line',
        data: this.data
      },
      {
        type: 'line',
        data: this.data2
      }
    ],
    credits: {
      enabled: false,
    },
    accessibility: {
      enabled: false
    }
    // rangeSelector: {
    //   enabled: true,
    //   buttonTheme: {
    //     fill: 'none',
    //     style: {
    //       color: 'red',
    //       fontWeight: 'bold',
    //       fontSize: '16px'
    //     }
    //   },
    //   buttons: [
    //     {
    //       type: 'month',
    //       count: 1,
    //       text: '1m',
    //       title: 'pippo'
    //     }
    //   ]
    // }
  }

  public ngOnInit(): void {
    this.charts = Highstock.stockChart('chart', this.chartOptions);
  }
}
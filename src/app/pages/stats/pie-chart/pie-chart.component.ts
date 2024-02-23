import { Component, Input } from '@angular/core';
import * as Highcharts from 'highcharts';
import { pieChartData } from '../../../services/charts.service';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.scss'
})
export class PieChartComponent {
  @Input() public serie: any;
  public charts: any;
  public chartOptions: Highcharts.Options = {
    series: [],
    chart: {
      type: 'pie',
      backgroundColor: 'transparent'
    },
    title: {
      text: undefined
    },
    plotOptions: {
      pie: {
        dataLabels: {
          format: '<b>{point.name}</b><br>{point.percentage:.1f}%',
          enabled: true,
          distance: 60,
          style: {
            color: 'white',
            fontWeight: 'regular',
            fontSize: '12px'
          }
        },
        innerSize: '33%',
        borderRadius: 8,
        borderWidth: 4,
        borderColor: 'rgb(13, 17, 23)'
      }
    },
    credits: {
      enabled: false
    },
    accessibility: {
      enabled: false
    }
  }

  public ngOnInit(): void {
    this.initChart();
  }

  private initChart(): void {
    this.chartOptions.series?.push(this.normalizeData(this.serie));   
    this.charts = Highcharts.chart('chart-pie', this.chartOptions);
  }

  private normalizeData(data: pieChartData[]): any {
    let normalizedData: any = {
      animation: {
        duration : 1000
      },
      data: data,
      name: 'Segnalazioni per priorità'
    }
    return normalizedData;
  }
}

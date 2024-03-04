import { Component, Input } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.scss'
})
export class PieChartComponent {
  @Input() public serie: Highcharts.SeriesPieOptions = { type: 'pie' };

  public charts!: Highcharts.Chart;
  public chartOptions: Highcharts.Options = {
    series: [],
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      height: '300px'
    },
    title: {
      text: undefined
    },
    plotOptions: {
      pie: {
        dataLabels: {
          format: '<b>{point.name}</b><br>{point.percentage:.1f}%',
          enabled: true,
          distance: 20,
          style: {
            color: 'white',
            fontWeight: 'regular',
            fontSize: '12px',
          },
        },
        showInLegend: true,
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
    this.chartOptions.series?.push(this.serie);
    this.charts = Highcharts.chart('chart-pie', this.chartOptions);
  }
}

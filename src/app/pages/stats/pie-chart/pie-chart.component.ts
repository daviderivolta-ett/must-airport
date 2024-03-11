import { Component, Input } from '@angular/core';
import * as Highcharts from 'highcharts';
import { ChartsService } from '../../../services/charts.service';

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
  public chartId: string = this.chartsService.generateChartUniqueId();

  public chartOptions: Highcharts.Options = {
    series: [],
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      height: '300px',
    },
    legend : {
      itemStyle: {
        color: 'rgb(230, 237, 243)'
      },
      itemHoverStyle: {
        color: 'rgb(125, 133, 144)'
      }
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

  constructor(private chartsService: ChartsService) {}

  public ngAfterViewInit(): void {
    this.initChart();
  }

  private initChart(): void {  
    this.chartOptions.series?.push(this.serie);
    this.charts = Highcharts.chart(`${this.chartId}`, this.chartOptions);
  }
}

import { Component, Input } from '@angular/core';
import * as Highcharts from 'highcharts';
import { ChartsService } from '../../../services/charts.service';
import Drilldown from 'highcharts/modules/drilldown';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.scss'
})
export class PieChartComponent {
  @Input() public serie: Highcharts.SeriesPieOptions = { type: 'pie' };
  @Input() public drilldown: Highcharts.SeriesPieOptions[] = [];

  public charts!: Highcharts.Chart;
  public chartId: string = this.chartsService.generateChartUniqueId();

  public chartOptions: Highcharts.Options = {
    series: [],
    drilldown: {
      series: [],
      activeDataLabelStyle: {
        color: 'rgb(230, 237, 243)',
        textDecoration: 'none',
        textOutline: 'none',
      },
      breadcrumbs: {
        showFullPath: false,
        buttonTheme: {
          style: {
            color: 'rgb(230, 237, 243)',
          },
          states: {
            hover: {
              fill: 'transparent',
              style: {
                color: 'rgb(110, 118, 129)'
              }
            }
          }
        }
      }
    },
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      height: '300px'
    },
    legend: {
      itemStyle: {
        // color: 'rgb(230, 237, 243)'
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
        borderRadius: 4,
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

  constructor(private chartsService: ChartsService) { }

  public ngAfterViewInit(): void {
    this.initChart();
  }

  private initChart(): void {
    this.chartOptions.series?.push(this.serie);

    if (this.drilldown && this.chartOptions.drilldown) {
      Drilldown(Highcharts);
      this.chartOptions.drilldown.series = this.drilldown;
      // if (this.chartOptions.plotOptions && this.chartOptions.plotOptions.pie) {
      //   this.chartOptions.plotOptions.pie.colors = Highcharts.getOptions().colors?.map((c, i) => {
      //     return Highcharts.color('#d568fb')
      //       .brighten((i - 3) / 7)
      //       .get()
      //   });
      // }
    }

    this.charts = Highcharts.chart(`${this.chartId}`, this.chartOptions);
  }
}
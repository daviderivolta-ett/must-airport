import { Component, effect} from '@angular/core';
import { TimeChartComponent } from '../time-chart/time-chart.component';
import { ReportParent } from '../../../models/report-parent.model';
import { ReportsService } from '../../../services/reports.service';
import { ChartsService } from '../../../services/charts.service';

@Component({
  selector: 'app-stats-page',
  standalone: true,
  imports: [TimeChartComponent],
  templateUrl: './stats-page.component.html',
  styleUrl: './stats-page.component.scss'
})
export class StatsPageComponent {
  public reports: ReportParent[] = [];
  public reportsNumPerTimeSerie: [number, number][] = [];

  constructor(private reportsService: ReportsService, private chartsService: ChartsService) {
    effect(() => {
      this.reports = this.reportsService.reportsSignal();
      this.reportsNumPerTimeSerie = this.chartsService.createReportsNumPerTimeSerie(this.reports);
    });
  }
}
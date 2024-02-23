import { Component, effect} from '@angular/core';
import { TimeChartComponent } from '../time-chart/time-chart.component';
import { ReportParent } from '../../../models/report-parent.model';
import { ReportsService } from '../../../services/reports.service';
import { ChartsService, pieChartData, timeChartData } from '../../../services/charts.service';
import { PieChartComponent } from '../pie-chart/pie-chart.component';

@Component({
  selector: 'app-stats-page',
  standalone: true,
  imports: [TimeChartComponent, PieChartComponent],
  templateUrl: './stats-page.component.html',
  styleUrl: './stats-page.component.scss'
})
export class StatsPageComponent {
  public reports: ReportParent[] = [];
  public reportsNumPerTimeSerie: [number, number][] = [];
  public reportsNumPerPrioritySerie: pieChartData[] = [];
  public interventionsPerTimeSerie: timeChartData[] = [];
  public inspectionsPerTimeSerie: timeChartData[] = [];

  constructor(private reportsService: ReportsService, private chartsService: ChartsService) {
    effect(() => {
      this.reports = this.reportsService.reportsSignal();
      this.reportsNumPerTimeSerie = this.chartsService.createReportsNumPerTimeSerie(this.reports);
      this.reportsNumPerPrioritySerie = this.chartsService.createReportsNumPerPrioritySerie(this.reports);
      this.interventionsPerTimeSerie = this.chartsService.createInterventionsPerTimeSerie(this.reports);
      this.inspectionsPerTimeSerie = this.chartsService.createInspectionsPerTimeSerie(this.reports);

      console.log('Interventions: ', this.interventionsPerTimeSerie);
      console.log('Inspections: ', this.inspectionsPerTimeSerie);      
    });
  }
}
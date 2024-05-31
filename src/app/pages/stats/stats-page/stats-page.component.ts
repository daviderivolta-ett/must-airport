import { Component, effect } from '@angular/core';
import { TimeChartComponent } from '../time-chart/time-chart.component';
import { ReportParent } from '../../../models/report-parent.model';
import { ReportsService } from '../../../services/reports.service';
import { ChartsService } from '../../../services/charts.service';
import { PieChartComponent } from '../pie-chart/pie-chart.component';
import { ReportChild } from '../../../models/report-child.model';
import { ConfigService } from '../../../services/config.service';

@Component({
  selector: 'app-stats-page',
  standalone: true,
  imports: [TimeChartComponent, PieChartComponent],
  templateUrl: './stats-page.component.html',
  styleUrl: './stats-page.component.scss'
})
export class StatsPageComponent {
  public parentReports: ReportParent[] = [];
  public childrenReports: ReportChild[] = [];
  public reportsNumPerTimeSerie: Highcharts.SeriesLineOptions = { type: 'line' };
  public reportsNumPerPrioritySerie: Highcharts.SeriesPieOptions = { type: 'pie' };
  public interventionsPerTimeSerie: Highcharts.SeriesLineOptions = { type: 'line' };
  public inspectionsPerTimeSerie: Highcharts.SeriesLineOptions = { type: 'line' };

  public parentFlowTagsNumSeries: Highcharts.SeriesPieOptions[] = [];
  public parentFlowTagsNumDrilldownSeries: Highcharts.SeriesPieOptions[] = [];

  public techElementTagsNumSerie: Highcharts.SeriesPieOptions = { type: 'pie' };
  public techElementSubTagsDrilldownNumSeries: Highcharts.SeriesPieOptions[] = [];
  public failureTagsNumSerie: Highcharts.SeriesPieOptions = { type: 'pie' };
  public failureSubTagsDrilldownNumSeries: Highcharts.SeriesPieOptions[] = [];

  constructor(private configService: ConfigService, private reportsService: ReportsService, private chartsService: ChartsService) {
    effect(async () => {
      this.parentReports = this.reportsService.reportsSignal();

      const childReportsPromises = this.parentReports.map(async (report) => {
        const childIds = report.childrenIds;
        const childReports = await Promise.all(childIds.map(async (id) => {
          return await this.reportsService.getChildReportById(id);
        }));
        return childReports;
      });

      this.childrenReports = (await Promise.all(childReportsPromises)).flat();

      this.reportsNumPerTimeSerie = this.chartsService.createReportsNumPerTimeSerie(this.parentReports);
      this.reportsNumPerPrioritySerie = this.chartsService.createReportsNumPerPrioritySerie(this.parentReports);
      this.interventionsPerTimeSerie = this.chartsService.createInterventionsPerTimeSerie(this.parentReports);
      this.inspectionsPerTimeSerie = this.chartsService.createInspectionsPerTimeSerie(this.parentReports);

      const { series, drilldownSeries } = this.chartsService.createParentFlowTagsSerie(this.configService.config.tags, this.parentReports);
      this.parentFlowTagsNumSeries = [...series];
      this.parentFlowTagsNumDrilldownSeries = [...drilldownSeries];

    });
  }
}
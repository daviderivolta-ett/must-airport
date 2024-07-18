import { Component, effect } from '@angular/core';
import { TimeChartComponent } from '../time-chart/time-chart.component';
import { ReportParent } from '../../../models/report-parent.model';
import { ReportsService } from '../../../services/reports.service';
import { ChartsService } from '../../../services/charts.service';
import { PieChartComponent } from '../pie-chart/pie-chart.component';
import { ReportChild } from '../../../models/report-child.model';
import { ConfigService } from '../../../services/config.service';
import { Inspection } from '../../../models/operation.model';
import { OperationsService } from '../../../services/operations.service';
import { StatusDetail } from '../../../models/priority.model';

@Component({
  selector: 'app-stats-page',
  standalone: true,
  imports: [TimeChartComponent, PieChartComponent],
  templateUrl: './stats-page.component.html',
  styleUrl: './stats-page.component.scss'
})
export class StatsPageComponent {
  public labels: { [key: string]: StatusDetail } = {};

  public parentReports: ReportParent[] = [];
  public childrenReports: ReportChild[] = [];
  public operations: Inspection[] = [];

  public reportsNumPerTimeSerie: Highcharts.SeriesLineOptions = { type: 'line' };
  public reportsNumPerPrioritySerie: Highcharts.SeriesPieOptions = { type: 'pie' };
  public interventionsPerTimeSerie: Highcharts.SeriesLineOptions = { type: 'line' };
  public inspectionsPerTimeSerie: Highcharts.SeriesLineOptions = { type: 'line' };

  public parentFlowTagsNumSeries: Highcharts.SeriesPieOptions[] = [];
  public parentFlowTagsNumDrilldownSeries: Highcharts.SeriesPieOptions[] = [];
  public childFlowTagsNumSeries: Highcharts.SeriesPieOptions[] = [];
  public childFlowTagsNumDrilldownSeries: Highcharts.SeriesPieOptions[] = [];

  public techElementTagsNumSerie: Highcharts.SeriesPieOptions = { type: 'pie' };
  public techElementSubTagsDrilldownNumSeries: Highcharts.SeriesPieOptions[] = [];
  public failureTagsNumSerie: Highcharts.SeriesPieOptions = { type: 'pie' };
  public failureSubTagsDrilldownNumSeries: Highcharts.SeriesPieOptions[] = [];

  constructor(
    private configService: ConfigService,
    private reportsService: ReportsService,
    private operationsService: OperationsService,
    private chartsService: ChartsService
  ) {
    effect(() => this.labels = this.configService.config.labels.priority);
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

      this.operations = await this.operationsService.getAllInspections();

      this.reportsNumPerTimeSerie = this.chartsService.createReportsNumPerTimeSerie(this.parentReports);
      this.reportsNumPerPrioritySerie = this.chartsService.createReportsNumPerPrioritySerie(this.parentReports, this.labels);
      this.interventionsPerTimeSerie = this.chartsService.createInterventionsPerTimeSerie(this.operations);
      this.inspectionsPerTimeSerie = this.chartsService.createInspectionsPerTimeSerie(this.operations);

      const { series: parentSeries, drilldownSeries: parentDrilldownSeries } = this.chartsService.createTagsSerie(this.configService.config.tags.parent, this.parentReports);
      this.parentFlowTagsNumSeries = [...parentSeries];
      this.parentFlowTagsNumDrilldownSeries = [...parentDrilldownSeries];

      const { series: childSeries, drilldownSeries: childDrilldownSeries } = this.chartsService.createTagsSerie(this.configService.config.tags.child, this.childrenReports);
      this.childFlowTagsNumSeries = [...childSeries];
      this.childFlowTagsNumDrilldownSeries = [...childDrilldownSeries];
    });
  }
}
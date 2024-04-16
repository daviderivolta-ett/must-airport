import { Component } from '@angular/core';
import { ParentReportDetailComponent } from '../../../components/parent-report-detail/parent-report-detail.component';
import { ReportsService } from '../../../services/reports.service';
import { ConfigService } from '../../../services/config.service';

@Component({
  selector: 'app-parent-report-detail-closed',
  standalone: true,
  imports: [],
  templateUrl: './parent-report-detail-closed.component.html',
  styleUrl: './parent-report-detail-closed.component.scss'
})
export class ParentReportDetailClosedComponent extends ParentReportDetailComponent {
  constructor(reportsService: ReportsService, configService: ConfigService){
    super(reportsService, configService);
  }
}

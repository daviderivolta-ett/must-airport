import { Component } from '@angular/core';
import { ParentReportDetailComponent } from '../../../components/parent-report-detail/parent-report-detail.component';
import { ReportParentClosingDataDb, ReportsService } from '../../../services/reports.service';
import { DatePipe, NgClass } from '@angular/common';
import { ChildReportCardComponent } from '../../../components/child-report-card/child-report-card.component';
import { MiniMapComponent } from '../../../components/mini-map/mini-map.component';
import { Router } from '@angular/router';
import { ConfigService } from '../../../services/config.service';


@Component({
  selector: 'app-parent-report-detail-archived',
  standalone: true,
  imports: [DatePipe, NgClass, MiniMapComponent, ChildReportCardComponent],
  templateUrl: './parent-report-detail-archived.component.html',
  styleUrl: './parent-report-detail-archived.component.scss'
})
export class ParentReportDetailArchivedComponent extends ParentReportDetailComponent {
  constructor(reportsService: ReportsService, configService: ConfigService, private router: Router){
    super(reportsService, configService);
  }

  public async restoreReport(): Promise<void> {
    let data: ReportParentClosingDataDb = {
      archived: false,
      archivingTime: null
    }  

    await this.reportsService.setReportById(this.parentReport.id, data);
    this.router.navigate(['/archivio']);
  }
}
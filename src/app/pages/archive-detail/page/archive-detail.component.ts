import { Component } from '@angular/core';
import { ReportParentDb, ReportsService } from '../../../services/reports.service';
import { ConfigService } from '../../../services/config.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportParent } from '../../../models/report-parent.model';
import { ParentReportDetailArchivedComponent } from '../parent-report-detail-archived/parent-report-detail-archived.component';
import { ParentReportDetailClosedComponent } from '../parent-report-detail-closed/parent-report-detail-closed.component';

@Component({
  selector: 'app-archive-detail',
  standalone: true,
  imports: [ParentReportDetailArchivedComponent, ParentReportDetailClosedComponent],
  templateUrl: './archive-detail.component.html',
  styleUrl: './archive-detail.component.scss'
})
export class ArchiveDetailComponent {
  public id: string = '';
  public parentReport: ReportParent = ReportParent.createEmpty();

  constructor(private router: Router, private route: ActivatedRoute, private reportsService: ReportsService, private configService: ConfigService) { }

  public async ngOnInit(): Promise<void> {
    const id: string | null = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.id = id;
    try {
      const parentReportDb: ReportParentDb = await this.reportsService.getParentReportById(id);
      this.parentReport = this.reportsService.parseParentReport(id, parentReportDb);
    } catch (error) {
      this.router.navigate(['/']);
    }
  }
}

import { Component, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportParent } from '../../../models/report-parent.model';
import { ReportChild } from '../../../models/report-child.model';
import { TechElementTag } from '../../../models/tech-element-tag.model';
import { DictionaryService } from '../../../services/dictionary.service';
import { ValidationFormComponent } from '../validation-form/validation-form.component';
import { ReportsService } from '../../../services/reports.service';
import { FailureTag } from '../../../models/failure-tag.model';
import { DatePipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [ValidationFormComponent, DatePipe, NgClass],
  templateUrl: './management.component.html',
  styleUrl: './management.component.scss'
})
export class ManagementComponent {
  public id: string | null = null;
  public parentReport: ReportParent = ReportParent.createEmpty();
  public childrenReport: ReportChild[] = [];
  public techElementTags: TechElementTag[] = [];
  public failureTags: FailureTag[] = [];

  constructor(private route: ActivatedRoute, private dictionaryService: DictionaryService, private reportsService: ReportsService) {
    effect(async () => {
      this.parentReport = this.reportsService.selectedReportSignal();
      this.childrenReport = await this.reportsService.populateChildrenReports(this.parentReport.childrenIds);
      this.childrenReport.map((report: ReportChild) => {
        if (report.tagFailure != undefined) report = this.reportsService.populateFailureTags(report);
        if (report.subTagFailure != undefined) report = this.reportsService.populateFailureSubtags(report);
      });
    });
    effect(() => this.techElementTags = this.dictionaryService.techElementTagsSignal());
    effect(() => this.failureTags = this.dictionaryService.failureTagsSignal());
  }

  async ngOnInit(): Promise<void> {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {     
      this.reportsService.selectReport(this.id);
    }
  }
}

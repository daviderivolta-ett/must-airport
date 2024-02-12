import { Component, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportParent } from '../../../models/report-parent.model';
import { ReportChild } from '../../../models/report-child.model';
import { TechElementTag } from '../../../models/tech-element-tag.model';
import { DictionaryService } from '../../../services/dictionary.service';
import { ValidationFormComponent } from '../validation-form/validation-form.component';
import { ReportsService } from '../../../services/reports.service';
import { FailureTag } from '../../../models/failure-tag.model';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [ValidationFormComponent],
  templateUrl: './management.component.html',
  styleUrl: './management.component.scss'
})
export class ManagementComponent {
  public techElementTags: TechElementTag[] = [];
  public failureTags: FailureTag[] = [];
  public id: string | null = null;
  public parentReport: ReportParent = ReportParent.createEmpty();
  public childrenReport: ReportChild[] = [];

  constructor(private route: ActivatedRoute, private dictionaryService: DictionaryService, private reportsService: ReportsService) {
    effect(() => {
      this.parentReport = this.reportsService.selectedReport();
      this.techElementTags = this.dictionaryService.techElementTags();
      this.failureTags = this.dictionaryService.failureTags();
    });
  }

  ngOnInit(): void {
    // await this.dictionaryService.getAll();

    this.id = this.route.snapshot.paramMap.get('id');
    // this.parentReport = history.state.parentReport;
    // this.childrenReport = history.state.childrenReport;

    if (this.id) this.reportsService.selectReport(this.id);
    // console.log(this.id);
    // console.log(this.parentReport);
    // this.techElementTags = this.dictionaryService.techElementTags();

    // console.log(this.techElementTags);
    // console.log(this.childrenReport);
  }
}

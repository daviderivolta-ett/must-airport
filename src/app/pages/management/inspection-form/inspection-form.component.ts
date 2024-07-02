import { Component, Input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OperationsService } from '../../../services/operations.service';
import { Inspection, InspectionLink, OPERATIONTYPE } from '../../../models/operation.model';
import { ReportParent } from '../../../models/report-parent.model';
import { ReportsService } from '../../../services/reports.service';
import { SnackbarService } from '../../../observables/snackbar.service';
import { SNACKBAROUTCOME, SNACKBARTYPE } from '../../../models/snackbar.model';
import { LabelPipe } from '../../../pipes/label.pipe';
import { TitleCasePipe } from '@angular/common';
import { SentenceCasePipe } from '../../../pipes/sentence-case.pipe';

@Component({
  selector: 'app-inspection-form',
  standalone: true,
  imports: [ReactiveFormsModule, LabelPipe, TitleCasePipe, SentenceCasePipe],
  templateUrl: './inspection-form.component.html',
  styleUrl: './inspection-form.component.scss'
})
export class InspectionFormComponent {
  public inspectionForm = this.fb.group({
    operator: ['', Validators.required],
    date: [null, Validators.required],
    type: ['inspection', Validators.required]
  });

  public today: Date = new Date(Date.now());
  @Input() public parentReport: ReportParent = ReportParent.createEmpty();

  constructor(
    private fb: FormBuilder,
    private operationsService: OperationsService,
    private reportsService: ReportsService,
    private snackbarService: SnackbarService
  ) { }

  public async handleSubmit(): Promise<void> {
    let inspection: Inspection = new Inspection(
      new Date(this.inspectionForm.value.date!),
      '',
      '',
      this.parentReport.id,
      this.inspectionForm.value.operator!,
      this.inspectionForm.value.type! as OPERATIONTYPE
    );

    let link: InspectionLink = new InspectionLink(
      OPERATIONTYPE.Maintenance,
      this.parentReport.id,
      this.parentReport.verticalId
    );

    if (inspection.type === 'inspection') {
      switch (this.parentReport.childFlowIds[0]) {
        case 'horizontal':
          inspection.type = OPERATIONTYPE.InspectionHorizontal;
          link.childFlowId = OPERATIONTYPE.InspectionHorizontal;
          break;

        case 'vertical':
          inspection.type = OPERATIONTYPE.InspectionVertical;
          link.childFlowId = OPERATIONTYPE.InspectionVertical;
          break;

        default:
          inspection.type = OPERATIONTYPE.Inspection;
          link.childFlowId = OPERATIONTYPE.Inspection;
          break;
      }
    } else {
      inspection.type = OPERATIONTYPE.Maintenance;
      link.childFlowId = OPERATIONTYPE.Maintenance;
    }

    try {
      inspection.linkId = await this.operationsService.setOperationLink(link);
      let inspectionId: string = await this.operationsService.setInspection(inspection);
      this.parentReport.operations.push(inspectionId);
      await this.reportsService.setReportById(this.parentReport.id, { operations: this.parentReport.operations });
    } catch (error) {
      let msg = 'Si è verificato un errore. Riprovare.'
      this.snackbarService.createSnackbar(msg, SNACKBARTYPE.Closable, SNACKBAROUTCOME.Success);
    }

    this.inspectionForm.reset();
  }
}
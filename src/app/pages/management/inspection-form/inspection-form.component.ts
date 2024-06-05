import { Component, Input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OperationsService } from '../../../services/operations.service';
import { OperationDb } from '../../../models/operation.model';
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

  constructor(private fb: FormBuilder, private operationsService: OperationsService, private reportsService: ReportsService, private snackbarService: SnackbarService) { }

  public async handleSubmit(): Promise<void> {
    let operation: OperationDb = this.operationsService.parseOperationFormData(this.inspectionForm.value);

    let operationLink: any = {
      reportParentId: this.parentReport.id,
      verticalId: this.parentReport.verticalId,
      type: 'activateChildFlow'
    };

    let msg: string;

    try {
      switch (operation.type) {
        case 'inspection':
          msg = 'Intervento creato con successo.';

          if (this.parentReport.childFlowIds[0] === 'horizontal') {
            operationLink.childFlowId = 'inspectionHorizontal';
            operation.type = 'inspectionHorizontal';
          } else {
            operationLink.childFlowId = 'inspectionVertical';
            operation.type = 'inspectionVertical';
          }

          break;

        default:
          msg = 'Ispezione creata con successo.';
          operationLink.childFlowId = 'maintenance';
          break;
      }

      const operationLinkId: string = await this.operationsService.setOperationLink(operationLink);
      operation.operationLink = operationLinkId;

      await this.reportsService.setOperationsByReportId(this.parentReport.id, operation);
      this.snackbarService.createSnackbar(msg, SNACKBARTYPE.Closable, SNACKBAROUTCOME.Success);
    } catch (error) {
      msg = 'Si è verificato un errore. Riprovare.'
      this.snackbarService.createSnackbar(msg, SNACKBARTYPE.Closable, SNACKBAROUTCOME.Success);
    }
    this.inspectionForm.reset();
  }
}
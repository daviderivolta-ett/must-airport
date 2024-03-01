import { Component, Input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InspectionsService } from '../../../services/inspections.service';
import { OperationDb } from '../../../models/operation.model';
import { ReportParent } from '../../../models/report-parent.model';
import { ReportsService } from '../../../services/reports.service';
import { SnackbarService } from '../../../observables/snackbar.service';
import { SNACKBAROUTCOME, SNACKBARTYPE } from '../../../models/snackbar.model';

@Component({
  selector: 'app-inspection-form',
  standalone: true,
  imports: [ReactiveFormsModule],
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

  constructor(private fb: FormBuilder, private inspectionsService: InspectionsService, private reportsService: ReportsService, private snackbarService: SnackbarService) { }

  public async handleSubmit(): Promise<void> {
    let operation: OperationDb = this.inspectionsService.parseInspectionFormData(this.inspectionForm.value);
    let msg: string;

    try {
      switch (operation.type) {
        case 'intervention':
          msg = 'Intervento creato con successo.';
          break;
        case 'inspection':
          msg = 'Ispezione creata con successo.';
          break;
        default:
          msg = 'Ispezione creata con successo.';
          break;
      }
      await this.reportsService.setOperationsByReportId(this.parentReport.id, operation);
      this.snackbarService.createSnackbar(msg, SNACKBARTYPE.Closable, SNACKBAROUTCOME.Success);
    } catch (error) {
      msg = 'Si è verificato un errore. Riprovare.'
      this.snackbarService.createSnackbar(msg, SNACKBARTYPE.Closable, SNACKBAROUTCOME.Success);
    }
    this.inspectionForm.reset();
  }
}
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InspectionsService } from '../../../services/inspections.service';

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

  constructor(private fb: FormBuilder, private inspectionsService: InspectionsService) { }

  public handleSubmit(): void {
    let operation: any = this.inspectionsService.parseInspectionFormData(this.inspectionForm.value);
    console.log(operation);
  }
}

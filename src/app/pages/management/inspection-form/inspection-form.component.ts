import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-inspection-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './inspection-form.component.html',
  styleUrl: './inspection-form.component.scss'
})
export class InspectionFormComponent {
  public inspectionForm = this.fb.group({
    name: ['', Validators.required],
    date: [null, Validators.required],
    type: this.fb.group({
      type: ['inspection', Validators.required]
    })
  });

  constructor(private fb: FormBuilder) { }

  public handleSubmit(): void {
    console.log(this.inspectionForm.value);
  }
}

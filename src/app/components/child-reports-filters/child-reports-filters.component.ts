import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ChildReportFiltersFormData } from '../../services/reports.service';

@Component({
  selector: 'app-child-reports-filters',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './child-reports-filters.component.html',
  styleUrl: './child-reports-filters.component.scss'
})
export class ChildReportsFiltersComponent {
  public filterForm = this.fb.group({
    maintenance: [true],
    inspection: [true],
    other: [true]
  });

  @Output() public filterEvent: EventEmitter<ChildReportFiltersFormData> = new EventEmitter<ChildReportFiltersFormData>();

  constructor(private fb: FormBuilder) {
    this.filterForm.valueChanges.subscribe((changes) => {
      const formData: ChildReportFiltersFormData = this.filterForm.value as ChildReportFiltersFormData;
      this.filterEvent.emit(formData);
    });
  }
}

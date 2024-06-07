import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OperationsFiltersFormData, OperationsService, ParsedOperationsFiltersFormData } from '../../../services/operations.service';
import { LabelPipe } from '../../../pipes/label.pipe';
import { SentenceCasePipe } from '../../../pipes/sentence-case.pipe';

@Component({
  selector: 'app-calendar-filters',
  standalone: true,
  imports: [ReactiveFormsModule, LabelPipe, SentenceCasePipe],
  templateUrl: './calendar-filters.component.html',
  styleUrl: './calendar-filters.component.scss'
})
export class CalendarFiltersComponent {
  public today: Date = new Date(Date.now());
  public filterForm: FormGroup = this.fb.group({
    type: ['all'],
    initialDate: [''],
    endingDate: ['']
  });

  constructor(private fb: FormBuilder, private operationsService: OperationsService) {
    this.filterForm.valueChanges.subscribe(changes => {
      const filtersFormData: OperationsFiltersFormData = this.filterForm.value as OperationsFiltersFormData;
      const parsedFormData: ParsedOperationsFiltersFormData = this.operationsService.parseOperationsFiltersFormData(filtersFormData);
      this.operationsService.filterOperations(parsedFormData);      
    });    
  }
}
import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FiltersFormData, ReportsService } from '../../../services/reports.service';
import { FiltersService } from '../../../observables/filters.service';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss'
})
export class FiltersComponent {
  public filterForm = this.fb.group({
    notAssigned: [true],
    low: [true],
    medium: [true],
    high: [true]
  });
  public isOpen: boolean = false;

  constructor(private fb: FormBuilder, private filtersService: FiltersService, private reportsService: ReportsService) {
    this.filterForm.valueChanges.subscribe(changes => {
      console.log(this.filterForm.value);
      this.reportsService.filterReports(this.filterForm.value as FiltersFormData)
      this.filtersService.filtersLastState = this.filterForm.value as FiltersFormData;
    });
  }

  ngOnInit(): void {
    this.filterForm.setValue(this.filtersService.filtersLastState);
  }

  public toggleFilters(): void {
    this.isOpen = !this.isOpen;
  }
}
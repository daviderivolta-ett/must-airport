import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FiltersFormData, ReportsService } from '../../services/reports.service';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss'
})
export class FiltersComponent {
  public filtersForm = this.fb.group({
    priority: ['low']
  });
  public isOpen: boolean = false;

  constructor(private fb: FormBuilder, private reportsService: ReportsService) {
    this.filtersForm.valueChanges.subscribe(changes => this.reportsService.filterReports(changes as FiltersFormData));
  }

  public toggleFilters(): void {
    this.isOpen = !this.isOpen;
  }
}
import { NgClass } from '@angular/common';
import { Component, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FiltersFormData, ParsedFiltersFormData, ReportsService } from '../../../services/reports.service';
import { FiltersService } from '../../../observables/filters.service';
import { LoggedUser } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss'
})
export class FiltersComponent {
  public filterForm = this.fb.group({
    closed: [true],
    notAssigned: [true],
    low: [true],
    medium: [true],
    high: [true],
    initialDate: [new Date(Date.now())],
    endingDate: [new Date(Date.now())]
  });
  public isOpen: boolean = false;
  public today: Date = new Date(Date.now());
  public loggedUser: LoggedUser | null = null;

  constructor(private fb: FormBuilder, private filtersService: FiltersService, private reportsService: ReportsService, private authService: AuthService) {
    effect(() => this.loggedUser = this.authService.loggedUserSignal());
    this.filterForm.valueChanges.subscribe(changes => {
      const filtersFormData: FiltersFormData = this.filterForm.value as FiltersFormData;
      const parsedFiltersFormData: ParsedFiltersFormData = this.parseFiltersFormData(filtersFormData);      
      this.reportsService.filterReports(parsedFiltersFormData);
      this.filtersService.filtersLastState = filtersFormData;
    });
  }

  ngOnInit(): void {
    this.filterForm.setValue(this.filtersService.filtersLastState);
  }

  public toggleFilters(): void {
    this.isOpen = !this.isOpen;
  }

  private parseFiltersFormData(value: FiltersFormData): ParsedFiltersFormData {
    let parsedValue: ParsedFiltersFormData = {
      priority: {
        closed: value.closed,
        notAssigned: value.notAssigned,
        low: value.low,
        medium: value.medium,
        high: value.high
      },
      date: {
        initialDate: null,
        endingDate: null
      }
    }
    if (value.initialDate !== null) {
      typeof value.initialDate === 'string' && value.initialDate === '' ? parsedValue.date.initialDate = null : parsedValue.date.initialDate = new Date(value.initialDate);
    }
    if (value.endingDate !== null) {
      typeof value.endingDate === 'string' && value.endingDate === '' ? parsedValue.date.endingDate = null : parsedValue.date.endingDate = new Date(value.endingDate);
    }
    return parsedValue;
  }
}
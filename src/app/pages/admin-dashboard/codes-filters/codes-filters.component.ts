import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CodesFiltersFormData, CodesService } from '../../../services/codes.service';
import { Code } from '../../../models/code.model';
import { VERTICAL } from '../../../models/app-flow.model';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-codes-filters',
  standalone: true,
  imports: [ReactiveFormsModule, TitleCasePipe],
  templateUrl: './codes-filters.component.html',
  styleUrl: './codes-filters.component.scss'
})
export class CodesFiltersComponent {
  @Input() public allCodes: Code[] = [];
  @Input() public apps: VERTICAL[] = [];
  public filterForm: FormGroup = this.fb.group({
    vertId: ['all'],
    appType: ['all'],
    isValid: ['all'],
  });

  constructor(private fb: FormBuilder, private codesService: CodesService) { }

  public ngOnInit(): void {
    this.filterForm.valueChanges.subscribe(changes => {
      const filtersFormData: CodesFiltersFormData = this.filterForm.value as CodesFiltersFormData;
      const parsedFormData = this.codesService.parseCodesFiltersFormData(filtersFormData);
      this.codesService.filterCodes(parsedFormData);         
    });
  }

  public ngAfterViewInit(): void {
    this.filterForm.setValue({ vertId: 'all', appType: 'all', isValid: 'all' });
  }
}
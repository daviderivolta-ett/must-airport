import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CodesService } from '../../../services/codes.service';
import { VERTICAL } from '../../../models/vertical.model';
import { TitleCasePipe } from '@angular/common';
import { VerticalNamePipe } from '../../../pipes/vertical-name.pipe';
import { AuthCode } from '../../../models/auth-code.model';

@Component({
  selector: 'app-codes-filters',
  standalone: true,
  imports: [ReactiveFormsModule, TitleCasePipe, VerticalNamePipe],
  templateUrl: './codes-filters.component.html',
  styleUrl: './codes-filters.component.scss'
})
export class CodesFiltersComponent {
  @Input() public codes: AuthCode[] = [];
  @Input() public apps: VERTICAL[] = [];
  public filterForm: FormGroup = this.fb.group({
    vertId: ['all'],
    appType: ['all'],
    isValid: ['all'],
  });

  constructor(private fb: FormBuilder, private codesService: CodesService) { }

  public ngOnInit(): void {
    this.filterForm.valueChanges.subscribe(changes => {
      // const filtersFormData: CodesFiltersFormData = this.filterForm.value as CodesFiltersFormData;
      // const parsedFormData = this.codesService.parseCodesFiltersFormData(filtersFormData);
      // this.codesService.filterCodes(parsedFormData);
      const formData: any = this.filterForm.value;
      this.codesService.filterAuthCodes(formData);
    });
  }

  public ngAfterViewInit(): void {
    this.filterForm.setValue({ vertId: 'all', appType: 'all', isValid: 'all' });
  }
}
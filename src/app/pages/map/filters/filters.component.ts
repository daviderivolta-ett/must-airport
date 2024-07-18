import { KeyValuePipe, NgClass, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, Output, effect } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LoggedUser } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';
import { LabelPipe } from '../../../pipes/label.pipe';
import { SentenceCasePipe } from '../../../pipes/sentence-case.pipe';
import { StatusDetail } from '../../../models/priority.model';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    NgStyle,
    LabelPipe,
    SentenceCasePipe,
    KeyValuePipe
  ],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss'
})
export class FiltersComponent {
  public form: FormGroup = this.fb.group({
    closed: [false],
    notAssigned: [true],
    initialDate: [''],
    endingDate: ['']
  });

  public isOpen: boolean = false;
  public today: Date = new Date(Date.now());
  public loggedUser: LoggedUser | null = null;

  private _labels: { [key: string]: StatusDetail } = {};
  public get labels(): { [key: string]: StatusDetail } {
    return this._labels;
  }
  @Input() public set labels(labels: { [key: string]: StatusDetail }) {
    this._labels = labels;
    this.updateStatusesAndForm(labels);
  }
  public statuses: { id: string, order: number, label: string }[] = [];

  @Output() public onFiltersChanged: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    effect(() => this.loggedUser = this.authService.loggedUserSignal());
    this.form.valueChanges.subscribe((changes: any) => this.onFiltersChanged.emit(changes));
  }

  private createStatusFormGroup(labels: { [key: string]: StatusDetail }): FormGroup {
    const group: FormGroup = this.fb.group({});
    for (const key in labels) {
      if (Object.prototype.hasOwnProperty.call(labels, key)) {
        group.addControl(key, new FormControl(true));
      }
    }
    return group;
  }

  private fillStatusesOrderArray(labels: { [key: string]: StatusDetail }): string[] {
    const statuses: string[] = [];
    for (const key in labels) {
      if (Object.prototype.hasOwnProperty.call(labels, key)) {
        statuses[labels[key].order] = key;
      }
    }

    return statuses;
  }

  private updateStatusesAndForm(labels: { [key: string]: StatusDetail }): void {
    this.statuses = this.fillStatusesOrderArray(labels).map((key: string) => ({
      id: key,
      order: labels[key].order,
      label: labels[key].displayName
    }));
    this.form.setControl('priority', this.createStatusFormGroup(labels));
  }

  public toggleFilters(): void {
    this.isOpen = !this.isOpen;
  }

  public closeDropdown(): void {
    this.isOpen = false;
  }
}
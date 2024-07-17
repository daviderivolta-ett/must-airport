import { KeyValuePipe, NgClass, NgStyle } from '@angular/common';
import { Component, EventEmitter, Output, effect } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LoggedUser } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';
import { LabelPipe } from '../../../pipes/label.pipe';
import { SentenceCasePipe } from '../../../pipes/sentence-case.pipe';
import { ConfigService } from '../../../services/config.service';
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
  public set labels(labels: { [key: string]: StatusDetail }) {
    this._labels = labels;
    this.form.addControl('priority', this.createStatusFormGroup(labels));
  }

  @Output() public onFiltersChanged: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private fb: FormBuilder
  ) {
    effect(() => this.loggedUser = this.authService.loggedUserSignal());
    effect(() => this.labels = this.configService.config.labels.priority);

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

  public toggleFilters(): void {
    this.isOpen = !this.isOpen;
  }

  public closeDropdown(): void {
    this.isOpen = false;
  }
}
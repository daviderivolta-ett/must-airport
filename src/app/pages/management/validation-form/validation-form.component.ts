import { Component, Input } from '@angular/core';
import { TechElementTag } from '../../../models/tech-element-tag.model';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportParent } from '../../../models/report-parent.model';
import { KeyValuePipe, NgFor } from '@angular/common';
import { FailureTag } from '../../../models/failure-tag.model';

@Component({
  selector: 'app-validation-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgFor, KeyValuePipe],
  templateUrl: './validation-form.component.html',
  styleUrl: './validation-form.component.scss'
})
export class ValidationFormComponent {
  public _report: ReportParent = ReportParent.createEmpty();
  @Input() set report(value: ReportParent) {
    if (value && value.id.length > 0) {
      this._report = value;
      this.initializeTagForm();
      this.initializeFailureTagsForm();
    }
  }

  public _techElementTags: TechElementTag[] = [];
  @Input() set techElementTags(value: TechElementTag[]) {
    if (value && value.length > 0) {
      // console.log(value);
      this._techElementTags = value;
    }
  };

  public _failureTags: FailureTag[] = [];
  @Input() set failureTags(value: FailureTag[]) {
    if (value && value.length > 0) {
      console.log(value);
      this._failureTags = value;
    }
  }

  public validationForm!: FormGroup;
  public tagForm!: FormGroup;
  public failureTagsForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.validationForm = this.fb.group({});

  }

  private initializeTagForm(): void {
    this.tagForm = this.fb.group({});
    for (const tag of this._techElementTags) {
      this.tagForm.addControl(tag.id, new FormControl(this._report.fields.tagTechElement.some((t: TechElementTag | string) => typeof t === 'string' ? t : t.id === tag.id)))
    }

    this.validationForm.addControl('tagForm', this.tagForm);
  }

  private initializeFailureTagsForm(): void {
    this.failureTagsForm = this.fb.group({});
    for (const failureTag of this._failureTags) {
      this.failureTagsForm.addControl(failureTag.id, new FormControl(true));
    }

    this.validationForm.addControl('failureTagsForm', this.failureTagsForm);
  }
}
import { Component, Input } from '@angular/core';
import { TechElementTag } from '../../../models/tech-element-tag.model';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportParent } from '../../../models/report-parent.model';
import { KeyValuePipe, NgFor } from '@angular/common';
import { FailureTag } from '../../../models/failure-tag.model';
import { ReportChild } from '../../../models/report-child.model';

@Component({
  selector: 'app-validation-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgFor, KeyValuePipe],
  templateUrl: './validation-form.component.html',
  styleUrl: './validation-form.component.scss'
})
export class ValidationFormComponent {
  public _parentReport: ReportParent = ReportParent.createEmpty();
  @Input() set parentReport(value: ReportParent) {
    if (value && value.id.length > 0) {
      this._parentReport = value;
      // console.log(value);
      this.initializeTechElementTagsForm();
    }
  }

  public _childrenReport: ReportChild[] = [];
  @Input() set childrenReport(value: ReportChild[]) {
    if (value && value.length > 0) {
      this._childrenReport = value;
      console.log(value);
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
      // console.log(value);
      this._failureTags = value;
    }
  }

  public validationForm!: FormGroup;
  public techElementTagsForm!: FormGroup;
  public failureTagsForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.validationForm = this.fb.group({});

  }

  private initializeTechElementTagsForm(): void {
    this.techElementTagsForm = this.fb.group({});
    for (const tag of this._techElementTags) {
      this.techElementTagsForm.addControl(tag.id, new FormControl(this._parentReport.fields.tagTechElement.some((t: TechElementTag | string) => typeof t === 'string' ? t : t.id === tag.id)))
    }

    this.validationForm.addControl('techElementTagsForm', this.techElementTagsForm);
  }

  private initializeFailureTagsForm(): void {
    this.failureTagsForm = this.fb.group({});
    for (const failureTag of this._failureTags) {   
      this.failureTagsForm.addControl(failureTag.id, new FormControl(this._childrenReport.some(report => report.tagFailure.some((r: FailureTag | string) => typeof r === 'string' ? r : r.id === failureTag.id))));
    }

    this.validationForm.addControl('failureTagsForm', this.failureTagsForm);
  }
}
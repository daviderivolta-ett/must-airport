import { Component, Input } from '@angular/core';
import { TechElementTag } from '../../../models/tech-element-tag.model';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportParent } from '../../../models/report-parent.model';
import { KeyValuePipe, NgFor } from '@angular/common';
import { FailureTag } from '../../../models/failure-tag.model';
import { ReportChild } from '../../../models/report-child.model';
import { DictionaryService } from '../../../services/dictionary.service';
import { TechElementSubTag } from '../../../models/tech-element-subtag.model';

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
      console.log('Parent reports :', value);
      this.initializeTechElementTagsForm();
      this.initializeTechElementSubTagsForm();
    }
  }

  public _childrenReport: ReportChild[] = [];
  @Input() set childrenReport(value: ReportChild[]) {
    if (value && value.length > 0) {
      this._childrenReport = value;
      // console.log('Children reports: ', value);
      this.initializeFailureTagsForm();
    }
  }

  public _techElementTags: TechElementTag[] = [];
  @Input() set techElementTags(value: TechElementTag[]) {
    if (value && value.length > 0) {
      console.log('Tech element tags: ', value);
      this._techElementTags = value;
    }
  };

  public _techElementSubTags: TechElementSubTag[] = [];

  public _failureTags: FailureTag[] = [];
  @Input() set failureTags(value: FailureTag[]) {
    if (value && value.length > 0) {
      // console.log('Failure tags:', value);
      this._failureTags = value;
    }
  }

  public validationForm!: FormGroup;
  public techElementTagsForm!: FormGroup;
  public techElementSubTagsForm !: FormGroup;
  public failureTagsForm!: FormGroup;

  constructor(private fb: FormBuilder, private dictionaryService: DictionaryService) {
    this.validationForm = this.fb.group({});

  }

  private initializeTechElementTagsForm(): void {
    this.techElementTagsForm = this.fb.group({});
    for (const tag of this._techElementTags) {
      this.techElementTagsForm.addControl(tag.id, new FormControl(this._parentReport.fields.tagTechElement.some((t: TechElementTag | string) => typeof t === 'string' ? t : t.id === tag.id)))
    }

    this.validationForm.addControl('techElementTagsForm', this.techElementTagsForm);
  }

  private initializeTechElementSubTagsForm(): void {
    this.techElementSubTagsForm = this.fb.group({});
    // console.log(this.techElementTagsForm.value);
    let validTagsId: string[] = [];
    for (const key in this.techElementTagsForm.value) {
      if (this.techElementTagsForm.value[key] === true) validTagsId.push(key);
    }
    let tags: TechElementTag[] = validTagsId.map((id: string) => this.dictionaryService.getTechElementTagById(id));
    let subTags: TechElementSubTag[] = [];
    tags.forEach(tag => tag.subTags.forEach(s => subTags.push(s)));
    // console.log(subTags);
    this._techElementSubTags = subTags;
    for (const subtag of this._techElementSubTags) {
      this.techElementSubTagsForm.addControl(subtag.id, new FormControl(this._parentReport.fields.subTagTechElement.some((t: TechElementSubTag | string) => typeof t === 'string' ? t : t.id === subtag.id)));
    }

    this.validationForm.addControl('techElementSubTagsForm', this.techElementSubTagsForm);
  }

  private initializeFailureTagsForm(): void {
    this.failureTagsForm = this.fb.group({});
    for (const failureTag of this._failureTags) {
      this.failureTagsForm.addControl(failureTag.id, new FormControl(this._childrenReport.some(report => {
        return report.tagFailure && report.tagFailure.some((r: FailureTag | string) => {
          return typeof r === 'string' ? r : r.id === failureTag.id
        });
      })));
    }

    this.validationForm.addControl('failureTagsForm', this.failureTagsForm);
  }
}
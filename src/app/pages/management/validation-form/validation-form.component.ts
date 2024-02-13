import { Component, Input } from '@angular/core';
import { TechElementTag } from '../../../models/tech-element-tag.model';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportParent } from '../../../models/report-parent.model';
import { KeyValuePipe, NgClass } from '@angular/common';
import { FailureTag } from '../../../models/failure-tag.model';
import { ReportChild } from '../../../models/report-child.model';
import { DictionaryService } from '../../../services/dictionary.service';
import { TechElementSubTag } from '../../../models/tech-element-subtag.model';

@Component({
  selector: 'app-validation-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, KeyValuePipe, NgClass],
  templateUrl: './validation-form.component.html',
  styleUrl: './validation-form.component.scss'
})
export class ValidationFormComponent {
  public isTechElementTagsFormOpen: boolean = false;
  public isTechElementSubTagsFormOpen: boolean = false;

  public _parentReport: ReportParent = ReportParent.createEmpty();
  @Input() set parentReport(value: ReportParent) {
    if (value && value.id.length > 0) {
      this._parentReport = value;
      // console.log('Parent reports :', value);
      this.initializeTechElementTagsForm();
      this.initializeTechElementSubTagsForm();
    }
  }

  public _childrenReport: ReportChild[] = [];
  @Input() set childrenReport(value: ReportChild[]) {
    if (value && value.length > 0) {
      this._childrenReport = value;
      // console.log('Children reports: ', value);
      // this.initializeFailureTagsForm();
    }
  }

  public _techElementTags: TechElementTag[] = [];
  @Input() set techElementTags(value: TechElementTag[]) {
    if (value && value.length > 0) {
      // console.log('Tech element tags: ', value);
      this._techElementTags = value;
    }
  };

  public _reportTechElementSubTags: TechElementSubTag[] = [];

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
  public priorityForm!: FormGroup;

  constructor(private fb: FormBuilder, private dictionaryService: DictionaryService) {
    this.validationForm = this.fb.group({
      priority: ['medium']
    });
  }

  private initializeTechElementTagsForm(): void {
    this.techElementTagsForm = this.fb.group({});
    for (const tag of this._techElementTags) {
      this.techElementTagsForm.addControl(tag.id, new FormControl(this._parentReport.fields.tagTechElement.some((t: TechElementTag | string) => typeof t === 'string' ? t : t.id === tag.id)))
    }
    this.validationForm.addControl('techElementTagsForm', this.techElementTagsForm);
    this.techElementTagsForm.valueChanges.subscribe(changes => this.updateTechElementSubTagsForm(changes));
  }

  private initializeTechElementSubTagsForm(): void {
    this.techElementSubTagsForm = this.fb.group({});
    let validTagsId: string[] = [];
    for (const key in this.techElementTagsForm.value) {
      if (this.techElementTagsForm.value[key] === true) validTagsId.push(key);
    }
    let tags: TechElementTag[] = validTagsId.map((id: string) => this.dictionaryService.getTechElementTagById(id));
    let subTags: TechElementSubTag[] = [];
    tags.forEach(tag => tag.subTags.forEach(s => subTags.push(s)));
    this._reportTechElementSubTags = subTags;
    for (const subtag of this._reportTechElementSubTags) {
      this.techElementSubTagsForm.addControl(subtag.id, new FormControl(this._parentReport.fields.subTagTechElement.some((t: TechElementSubTag | string) => typeof t === 'string' ? t : t.id === subtag.id)));
    }

    this.validationForm.addControl('techElementSubTagsForm', this.techElementSubTagsForm);
  }

  private updateTechElementSubTagsForm(values: any): void {
    // Lista dei controlli che dovrebbero esistere nel form
    const existingControls: string[] = [];

    let validTagsId: string[] = [];
    for (const key in values) {
      if (values[key] === true) validTagsId.push(key);
    }

    let tags: TechElementTag[] = validTagsId.map((id: string) => this.dictionaryService.getTechElementTagById(id));
    let subTags: TechElementSubTag[] = [];
    tags.forEach(tag => tag.subTags.forEach(s => subTags.push(s)));
    this._reportTechElementSubTags = subTags;

    for (const subtag of this._reportTechElementSubTags) {
      existingControls.push(subtag.id);

      const control = this.techElementSubTagsForm.get(subtag.id);
      if (control) {
        control.setValue(values[subtag.id] === true);
      } else {
        // Se il controllo non esiste, aggiungilo
        this.techElementSubTagsForm.addControl(subtag.id, new FormControl(values[subtag.id] === true));
      }
    }

    // Rimuovi i controlli che non dovrebbero più esistere nel form
    for (const control in this.techElementSubTagsForm.controls) {
      if (!existingControls.includes(control)) {
        this.techElementSubTagsForm.removeControl(control);
      }
    }

    this.validationForm.setControl('techElementSubTagsForm', this.techElementSubTagsForm);
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

  public handleSubmit(): void {
    console.log(this.validationForm.value);
  }

  public toggleTechElementTagsForm(): void {
    this.isTechElementTagsFormOpen = !this.isTechElementTagsFormOpen;
    if (this.isTechElementTagsFormOpen === true) this.isTechElementSubTagsFormOpen = false;
  }

  public toggleTechElementSubTagsForm(): void {
    this.isTechElementSubTagsFormOpen = !this.isTechElementSubTagsFormOpen;
    if (this.isTechElementSubTagsFormOpen === true) this.isTechElementTagsFormOpen = false;
  }
}
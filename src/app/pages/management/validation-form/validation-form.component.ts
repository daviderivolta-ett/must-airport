import { Component, Input } from '@angular/core';
import { TechElementTag } from '../../../models/tech-element-tag.model';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportParent } from '../../../models/report-parent.model';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-validation-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgFor],
  templateUrl: './validation-form.component.html',
  styleUrl: './validation-form.component.scss'
})
export class ValidationFormComponent {
  public _techElementTags: TechElementTag[] = [];
  @Input() set techElementTags(value: TechElementTag[]) {
    if (value && value.length > 0) {
      this._techElementTags = value;
      this.initializeForm();
    }
  };
  public techElementTagsFormArray: FormArray =  this.fb.array([]);

  public _report: ReportParent = ReportParent.createEmpty();
  @Input() set report(value: ReportParent) {
    if (value && value.id.length > 0) {
      this._report = value;
      this.populateForm();
    }
  }

  public validationForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.validationForm = this.fb.group({
      techElementTagsFormArray: new FormArray([]),
      // techElementSubTags: new FormArray([]),
      // failureTags: new FormArray([]),
      // failureSubTags: new FormArray([]),
      priority: ''
    });
  }

  private initializeForm(): void {   
    console.log(this._techElementTags);
    // for (const tag of this._techElementTags) {
    //   this.validationForm.addControl(tag.id, new FormControl(false))
    // }
    // console.log(JSON.stringify(this.validationForm.value));  
  }

  private populateForm(): void {
    // console.log(this._report);
    // const tag = this._report.fields.tagTechElement[0] as TechElementTag;
  
    // console.log(tag.id);    
    // console.log(this.validationForm.controls[tag.id]);
    // this.validationForm.controls[tag.id].setValue(true);

    // this._report.fields.tagTechElement.forEach((tag: any) => {
    //   this.validationForm.controls[tag.id].setValue(true);
    // });
    // console.log(this.validationForm);
    // this._report.fields.tagTechElement.forEach((tag: any) => {
    //   let id = tag.id;
    //   console.log(id);      
    //   if (this.validationForm.get(id) === id) {       
    //     this.validationForm.get(id)?.setValue(true);
    //   }
    // });
    
    // console.log(this.techElementTagsFormArray);    
    // this._report.fields.tagTechElement.forEach((tag: any) => {
    //   this.techElementTagsFormArray.push(tag);
    // });
    // this.techElementTagsFormArray.setValue(this._techElementTags);
    // console.log(this.techElementTagsFormArray);
  }
}

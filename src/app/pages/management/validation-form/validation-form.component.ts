import { Component, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReportParent } from '../../../models/report-parent.model';
import { KeyValuePipe, NgClass, TitleCasePipe } from '@angular/common';
import { Tag, TagGroup } from '../../../models/tag.model';
import { WebAppConfigTags } from '../../../models/config.model';
import { ControlLabelPipe } from '../../../pipes/control-label.pipe';
import { ReportChild } from '../../../models/report-child.model';

@Component({
  selector: 'app-validation-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, KeyValuePipe, NgClass, TitleCasePipe, ControlLabelPipe],
  templateUrl: './validation-form.component.html',
  styleUrl: './validation-form.component.scss'
})
export class ValidationFormComponent {
  constructor(private fb: FormBuilder) { }

  public baseForm: FormGroup = this.fb.group({});
  public priorityForm: FormGroup = this.fb.group({
    priority: ['', Validators.required]
  });

  private _report: ReportParent | null = null;

  public get report(): ReportParent | null {
    return this._report;
  }

  @Input() public set report(value: ReportParent) {
    if (!value || value.id.length === 0) return;
    this._report = value;
    this.priorityForm.setValue({ priority: this.report?.priority });
    this.patchControls([this.report?.fields]);
  }

  private _childrenReport: ReportChild[] = [];

  public get childrenReport(): ReportChild[] {
    return this._childrenReport;
  }

  @Input() public set childrenReport(value: ReportChild[]) {
    if (value.length === 0) return;
    this._childrenReport = value;

    let fields: any[] = [];
    this.childrenReport.forEach((report: ReportChild) => fields.push(report.fields));   
    this.patchControls(fields);
  }

  private _tags: WebAppConfigTags = { parent: { elements: [], groups: [] }, child: { elements: [], groups: [] } };

  public get tags() {
    return this._tags;
  }

  @Input() public set tags(value: WebAppConfigTags) {
    if (!value) return;
    this._tags = value;
    this.baseForm = this.createValidationForm(this.tags);
    this.baseForm.addControl('priority', this.priorityForm);

    this.baseForm.updateValueAndValidity();

    const controls: FormControl[] = this.searchForFormControl(this.baseForm);
    controls.forEach((control: FormControl) => control.valueChanges.subscribe((changes: any) => {
      this.updateVisibility(controls, control);
    }));

    console.log(this.baseForm);
  };

  private _tagGroups: TagGroup[] = [];

  public get tagGroups(): TagGroup[] {
    return this._tagGroups;
  }

  @Input() public set tagGroups(value: TagGroup[]) {
    if (!value) return;
    this._tagGroups = value;
  }

  private createValidationForm(tags: WebAppConfigTags): FormGroup {
    const baseForm: FormGroup = this.fb.group({});

    for (const key in this.tags) {
      this.tags[key as keyof WebAppConfigTags].groups.forEach((group: TagGroup) => {
        const formGroup: FormGroup = this.createFormGroup(baseForm, group, tags[key as keyof WebAppConfigTags].elements);
        baseForm.addControl(group.id, formGroup);
      });
    }
    return baseForm;
  }

  private createFormGroup(baseForm: FormGroup, group: TagGroup, tags: Tag[]): FormGroup {
    const formGroup: FormGroup = this.fb.group({});
    const formSubGroup: FormGroup = this.fb.group({});

    tags.forEach((tag: Tag) => {
      if (group.id === tag.type) {
        formGroup.addControl(tag.id.replaceAll('.', '_'), new FormControl(false));

        if (group.subGroup) {
          this.createFormSubGroup(formSubGroup, group.subGroup, tag.subTags);
          baseForm.addControl(group.subGroup.id, formSubGroup);
        }

      }
    });

    return formGroup;
  }

  private createFormSubGroup(formSubGroup: FormGroup, group: TagGroup, tags: Tag[]): FormGroup {
    tags.forEach((tag: Tag) => {
      if (tag.type === group.id) {
        const control = new FormControl(false);
        formSubGroup.addControl(tag.id.replaceAll('.', '_'), control);
        control.disable();
      }
      if (group.subGroup) this.createFormSubGroup(formSubGroup, group.subGroup, tag.subTags);
    });
    return formSubGroup;
  }

  public checkControls(groupKey: string): boolean {
    let foundGroup: FormGroup = this.fb.group({});

    Object.keys(this.baseForm.controls).forEach((key: string) => {
      if (key === groupKey) {
        let found: any = this.baseForm.get(key);
        if (found instanceof FormGroup) {
          foundGroup = found;
        }
      }
    });

    for (const key in foundGroup.controls) {
      if (foundGroup.controls[key].enabled) return false;
    }

    return true;
  }

  public updateVisibility(controls: FormControl[], control: FormControl): void {
    const ids: string[] = this.getIdsToActivate(controls, control);

    let formGroup: FormGroup = this.fb.group({});

    for (const id of ids) {
      for (const control of controls) {
        if (control.parent && (control.parent.get(id.replaceAll('.', '_')) === control)) {
          if (control.parent instanceof FormGroup) {
            formGroup = control.parent;
          }
        }
      }
    }

    Object.keys(formGroup.controls).forEach((key: string) => {
      for (const id of ids) {
        if (id.replaceAll('.', '_') === key) {
          let foundControl: any = formGroup.get(key);
          if (foundControl instanceof FormControl) {
            if (control.value) {
              foundControl.enable();
            } else {
              foundControl.setValue(false);
              foundControl.disable();
            }
          }
        }
      }
    });
  }

  private getIdsToActivate(controls: FormControl[], formControl: FormControl): string[] {
    let subTagsIds: string[] = [];

    controls.forEach((control: FormControl) => {
      if (formControl === control) {
        if (!formControl.parent) return;

        Object.keys(formControl.parent.controls).forEach((key: string) => {
          if (formControl.parent) {
            let foundControl: any = formControl.parent.get(key);
            if (formControl === foundControl) {
              let tag: Tag | undefined = this.getTagById(key);
              if (!tag) return;
              if (tag.subTags.length > 0) subTagsIds = tag.subTags.map((tag: Tag) => tag.id);
            }
          }
        });
      }
    });
    return subTagsIds;
  }

  public toggleDropdown(content: HTMLDivElement) {
    const currentState: string = content.style.display;
    const allDropdowns: HTMLDivElement[] = Array.from(document.querySelectorAll('.dropdown-content'));
    allDropdowns.forEach((dropdown: HTMLDivElement) => dropdown.style.display = 'none');
    currentState === 'none' ? content.style.display = 'block' : content.style.display = 'none';
  }

  private searchForFormControl(form: FormGroup): FormControl[] {
    let controls: FormControl[] = [];

    Object.keys(form.controls).forEach((control: string) => {
      if (control === 'priority') return;
      const foundControl: AbstractControl = form.controls[control];
      if (foundControl instanceof FormGroup) {
        const nestedControls: FormControl[] = this.searchForFormControl(foundControl);
        controls = controls.concat(nestedControls);
      }

      if (foundControl instanceof FormControl) controls.push(foundControl);
    });

    return controls;
  }

  private getTagById(id: string, tags: WebAppConfigTags = this.tags): Tag | undefined {
    for (const key in tags) {
      const elements = tags[key as keyof WebAppConfigTags].elements;
      for (const tag of elements) {
        if (tag.id === id.replaceAll('_', '.')) {
          return tag;
        } else if (tag.subTags.length > 0) {
          const subTag = this.getTagById(id, { parent: { elements: tag.subTags, groups: [] }, child: { elements: [], groups: [] } });
          if (subTag) return subTag;
        }
      }
    }
    return undefined;
  }

  private patchControls(fieldsArray: { [key: string]: any }[]) {    
    fieldsArray.forEach((fields: { [key: string]: any }) => {      
      for (const key in fields) {
        let values: any = fields[key];       
        if (!Array.isArray(values) || values.some((v: any) => typeof v !== 'string')) continue;

        const formGroup: FormGroup = this.baseForm.get(key) as FormGroup;
        
        if (formGroup) {
          values.forEach((value: string) => {
            
            for (const key in formGroup.controls) {
              if (value.replaceAll('.', '_') === key) formGroup.get(key)?.setValue(true);
            }
          });
        }
      }
    });
  }

  public handleSubmit(): void {
    console.log(this.baseForm.value);
    // let data: any = this.reportsService.parseValidationFormData(this.validationForm.value);
    // let msg: string;
    // try {
    //   if (!this._parentReport.validationDate) data.validationDate = Timestamp.now();
    //   if (!this._parentReport.isValidated) data.validated = true;
    //   this.reportsService.setReportById(this._parentReport.id, data);
    //   msg = 'Modifica salvata con successo';
    //   this.snackbarService.createSnackbar(msg, SNACKBARTYPE.Closable, SNACKBAROUTCOME.Success);
    // } catch (error) {
    //   msg = 'C\'è stato un errore nel salvataggio del report. Riprovare!'
    //   this.snackbarService.createSnackbar(msg, SNACKBARTYPE.Closable, SNACKBAROUTCOME.Error);
    // }
  }
}
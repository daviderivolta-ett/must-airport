import { Component, Input, Renderer2 } from '@angular/core';
import { TechElementTag } from '../../../models/tech-element-tag.model';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReportParent } from '../../../models/report-parent.model';
import { KeyValuePipe, NgClass, NgFor, NgIf, NgStyle, NgTemplateOutlet, TitleCasePipe } from '@angular/common';
import { FailureTag } from '../../../models/failure-tag.model';
import { ReportChild } from '../../../models/report-child.model';
import { DictionaryService } from '../../../services/dictionary.service';
import { TechElementSubTag } from '../../../models/tech-element-subtag.model';
import { ReportsService } from '../../../services/reports.service';
import { SnackbarService } from '../../../observables/snackbar.service';
import { Timestamp, doc } from 'firebase/firestore';
import { SNACKBAROUTCOME, SNACKBARTYPE } from '../../../models/snackbar.model';
import { Tag, TagGroup } from '../../../models/tag.model';
import { ConfigService } from '../../../services/config.service';
import { WebAppConfigTagGroup, WebAppConfigTags } from '../../../models/config.model';
import { ControlLabelPipe } from '../../../pipes/control-label.pipe';
import { PRIORITY } from '../../../models/priority.model';

class CustomFormGroup extends FormGroup {
  public customType: string;

  constructor(controls: { [key: string]: AbstractControl }, type: string) {
    super(controls);
    this.customType = type;
  }
}

@Component({
  selector: 'app-validation-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, KeyValuePipe, NgClass, NgStyle, TitleCasePipe, ControlLabelPipe],
  templateUrl: './validation-form.component.html',
  styleUrl: './validation-form.component.scss'
})
export class ValidationFormComponent {
  constructor(private fb: FormBuilder, private dictionaryService: DictionaryService, private configService: ConfigService) { }

  public baseForm: FormGroup = this.fb.group({});
  public priorityForm: FormGroup = this.fb.group({
    priority: [this.priority, Validators.required]
  });

  private _priority: PRIORITY = PRIORITY.NotAssigned;

  public get priority(): PRIORITY {
    return this._priority;
  }

  @Input() public set priority(value: PRIORITY) {
    if (!value) return;
    this._priority = value;
    this.priorityForm.setValue({ priority: value });
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

  private createFormGroup(baseForm: FormGroup, group: TagGroup, tags: Tag[]): CustomFormGroup {
    const formGroup: CustomFormGroup = new CustomFormGroup({}, 'parent');
    const formSubGroup: CustomFormGroup = new CustomFormGroup({}, 'child');

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

  private createFormSubGroup(formSubGroup: CustomFormGroup, group: TagGroup, tags: Tag[]): CustomFormGroup {
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

  // public updateVisibility(controls: FormControl[], control: FormControl): void {
  //   const ids: string[] = this.getIdsToActivate(controls, control);

  //   ids.forEach((id: string) => {
  //     if (control.parent) {
  //       const currentControl = control.parent.get(id.replaceAll('.', '_'));

  //       if (currentControl instanceof FormControl) {

  //         if (control.value) {
  //           currentControl.enable();
  //         } else {
  //           currentControl.setValue(false);
  //           currentControl.disable();
  //         }

  //       }
  //     }
  //   });
  // }

  // private getIdsToActivate(formControl: FormControl): string[] {
  //   let subTagsIds: string[] = [];  
  //   if (!formControl.parent) return subTagsIds;

  //   Object.keys(formControl.parent.controls).forEach((key: string) => {
  //     if (formControl.parent) {
  //       let foundControl: any = formControl.parent.get(key);

  //       if (formControl === foundControl) {
  //         let tag: Tag | undefined = this.getTagById(key);
  //         if (!tag) return;
  //         if (tag.subTags.length > 0) subTagsIds = tag.subTags.map((tag: Tag) => tag.id);
  //       }

  //     }
  //   });

  //   return subTagsIds;
  // }

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
    const currentState: any = content.style.display;
    currentState === 'none' ? content.style.display = 'block' : content.style.display = 'none';
  }

  // private flattenFormGroupsWithControls(formGroup: FormGroup): FormGroup[] {
  //   const formGroups: FormGroup[] = [];

  //   Object.keys(formGroup.controls).forEach((controlName: string) => {
  //     const control: AbstractControl = formGroup.controls[controlName];

  //     if (control instanceof FormGroup) {

  //       if (this.hasControls(control)) {
  //         formGroups.push(control);
  //       }
  //       const nestedFormGroups: FormGroup[] = this.flattenFormGroupsWithControls(control);
  //       formGroups.push(...nestedFormGroups);
  //     }
  //   });

  //   return formGroups;
  // }

  // private hasControls(formGroup: FormGroup): boolean {
  //   return Object.values(formGroup.controls).some(control => control instanceof FormControl);
  // }

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

  // private searchForChanges(object: any): string[] {
  //   let ids: string[] = [];

  //   for (const key in object) {
  //     if (object.hasOwnProperty(key)) {
  //       const obj: any = object[key];

  //       if (typeof obj === 'object') {
  //         const results: string[] = this.searchForChanges(obj);
  //         ids = ids.concat(results);
  //       }
  //       if (typeof obj === 'boolean' && obj) {
  //         ids.push(key);
  //       }
  //     }
  //   }
  //   return ids;
  // }

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

  // private createMainTagsFormGroup(group: TagGroup, tags: Tag[]): FormGroup {
  //   const mainFormGroup: FormGroup = this.fb.group({});

  //   tags.forEach((tag: Tag) => {
  //     if (tag.type === group.id) {
  //       const control: FormControl = new FormControl(false);
  //       mainFormGroup.addControl(tag.id, control);

  //       control.valueChanges.subscribe((isChecked: boolean) => {
  //         isChecked ? this.addSubTags(mainFormGroup, group.subGroup || null, tag.subTags) : this.removeSubTags(mainFormGroup, tag.subTags);
  //         console.log(this.baseForm);
  //       });
  //     }
  //   });

  //   return mainFormGroup;
  // }

  // private addSubTags(mainFormGroup: FormGroup, group: TagGroup | null, tags: Tag[]): void {
  //   if (!group) return;

  //   tags.forEach((tag: Tag) => {
  //     if (tag.type === group.id) {
  //       mainFormGroup.addControl(tag.id, new FormControl(false));
  //     }

  //     if (tag.subTags && tag.subTags.length > 0 && group.subGroup) {
  //       this.addSubTags(mainFormGroup, group.subGroup, tag.subTags);
  //     }
  //   });
  // }

  // private removeSubTags(mainFormGroup: FormGroup, tags: Tag[]): void {
  //   tags.forEach((tag: Tag) => {
  //     if (mainFormGroup.contains(tag.id)) {
  //       mainFormGroup.removeControl(tag.id);
  //     }
  //     if (tag.subTags && tag.subTags.length > 0) {
  //       this.removeSubTags(mainFormGroup, tag.subTags);
  //     }
  //   });
  // }

  private setInitialValues() {

  }

  //////
  // OLD
  //////
  public isTechElementTagsFormOpen: boolean = false;
  public isTechElementSubTagsFormOpen: boolean = false;

  public _parentReport: ReportParent = ReportParent.createEmpty();
  @Input() set parentReport(value: ReportParent) {
    if (value && value.id.length > 0) {
      this._parentReport = value;
      // console.log('Parent report:', value);
      // this.initializeTechElementTagsForm();
      // this.initializeTechElementSubTagsForm();

      // this.initializeParentFlowTags1Form();
      // this.initializeParentFlowTags2Form();
      // this.initializePriorityForm();
    }
  }

  public _childrenReport: ReportChild[] = [];
  @Input() set childrenReport(value: ReportChild[]) {
    if (value && value.length > 0) {
      this._childrenReport = value;
      // console.log('Children reports:', value);
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

  public _parentFlowTags: Tag[] = [];
  @Input() set parentFlowTags(value: Tag[]) {
    if (value && value.length > 0) {
      this._parentFlowTags = value;
    }
  }

  public _parentFlowTags2: Tag[] = [];

  public validationForm!: FormGroup;
  public techElementTagsForm!: FormGroup;
  public techElementSubTagsForm !: FormGroup;
  public failureTagsForm!: FormGroup;


  private initializeTechElementTagsForm(): void {
    this.techElementTagsForm = this.fb.group({});
    for (const tag of this._techElementTags) {
      this.techElementTagsForm.addControl(tag.id, new FormControl(this._parentReport.fields.tagTechElement.some((t: TechElementTag | string) => typeof t === 'string' ? t : t.id === tag.id)))
    }
    this.validationForm.addControl('techElementTagsForm', this.techElementTagsForm);
    this.techElementTagsForm.valueChanges.subscribe(changes => this.updateTechElementSubTagsForm(changes));
  }

  private initializeParentFlowTags1Form(): void {
    this.techElementTagsForm = this.fb.group({});
    for (const tag of this._parentFlowTags) {
      this.techElementTagsForm.addControl(tag.id, new FormControl(this._parentReport.fields.parentFlowTags1.some((t: Tag) => t.id === tag.id)));
    }
    this.validationForm.addControl('techElementTagsForm', this.techElementTagsForm);
    this.techElementTagsForm.valueChanges.subscribe(changes => this.updateParentFlowTags2Form(changes));
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

  private initializeParentFlowTags2Form(): void {
    this.techElementSubTagsForm = this.fb.group({});
    let validTagsId: string[] = [];
    for (const key in this.techElementTagsForm.value) {
      if (this.techElementTagsForm.value[key] === true) validTagsId.push(key);
    }
    let tags: Tag[] = validTagsId
      .map((id: string) => this.configService.parentFlowTags.find((tag: Tag) => tag.id === id))
      .filter((tag: Tag | undefined): tag is Tag => tag !== undefined);
    let subTags: Tag[] = [];
    // tags.forEach(tag => tag.options.forEach(s => subTags.push(s)));
    this._parentFlowTags2 = subTags;
    for (const subtag of this._parentFlowTags2) {
      this.techElementSubTagsForm.addControl(subtag.id, new FormControl(this._parentReport.fields.parentFlowTags2.some((t: Tag) => t.id === subtag.id)));
    }
    this.validationForm.addControl('techElementSubTagsForm', this.techElementSubTagsForm);
  }

  private initializePriorityForm(): void {
    this.priorityForm = this.fb.group({});
    this.priorityForm.addControl('priority', new FormControl(this._parentReport.priority, Validators.required));
    this.validationForm.addControl('priorityForm', this.priorityForm);
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

  private updateParentFlowTags2Form(values: any): void {
    // Lista dei controlli che dovrebbero esistere nel form
    const existingControls: string[] = [];

    let validTagsId: string[] = [];
    for (const key in values) {
      if (values[key] === true) validTagsId.push(key);
    }

    let tags: Tag[] = validTagsId
      .map((id: string) => this.configService.parentFlowTags.find((tag: Tag) => tag.id === id))
      .filter((tag: Tag | undefined): tag is Tag => tag !== undefined);
    let subTags: Tag[] = [];
    // tags.forEach(tag => tag.options.forEach(s => subTags.push(s)));
    this._parentFlowTags2 = subTags;

    for (const subtag of this._parentFlowTags2) {
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
        return report.fields.tagFailure && report.fields.tagFailure.some((r: FailureTag | string) => {
          return typeof r === 'string' ? r : r.id === failureTag.id
        });
      })));
    }

    this.validationForm.addControl('failureTagsForm', this.failureTagsForm);
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

  public toggleTechElementTagsForm(): void {
    this.isTechElementTagsFormOpen = !this.isTechElementTagsFormOpen;
    if (this.isTechElementTagsFormOpen === true) this.isTechElementSubTagsFormOpen = false;
  }

  public closeTechElementTagsForm(): void {
    this.isTechElementTagsFormOpen = false;
  }

  public toggleTechElementSubTagsForm(): void {
    this.isTechElementSubTagsFormOpen = !this.isTechElementSubTagsFormOpen;
    if (this.isTechElementSubTagsFormOpen === true) this.isTechElementTagsFormOpen = false;
  }

  public closeTechElementSubTagsForm(): void {
    this.isTechElementSubTagsFormOpen = false;
  }
}
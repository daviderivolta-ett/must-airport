import { Component, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReportParent } from '../../../models/report-parent.model';
import { KeyValuePipe, NgClass, TitleCasePipe } from '@angular/common';
import { Tag, TagGroup } from '../../../models/tag.model';
import { WebAppConfigTags } from '../../../models/config.model';
import { ControlLabelPipe } from '../../../pipes/control-label.pipe';
import { ReportChild } from '../../../models/report-child.model';
import { Timestamp } from 'firebase/firestore';
import { ReportsService } from '../../../services/reports.service';
import { LANGUAGE } from '../../../models/language.model';
import { AuthService } from '../../../services/auth.service';
import { SnackbarService } from '../../../observables/snackbar.service';
import { SNACKBAROUTCOME, SNACKBARTYPE } from '../../../models/snackbar.model';
import { VERTICAL } from '../../../models/vertical.model';
import { UtilsService } from '../../../services/utils.service';
import { LabelPipe } from '../../../pipes/label.pipe';
import { SentenceCasePipe } from '../../../pipes/sentence-case.pipe';

interface TagChanges {
  toAdd: { [key: string]: string[] },
  toRemove: { [key: string]: string[] }
}

@Component({
  selector: 'app-validation-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgClass,
    KeyValuePipe,
    TitleCasePipe,
    LabelPipe,
    ControlLabelPipe,
    SentenceCasePipe
  ],
  templateUrl: './validation-form.component.html',
  styleUrl: './validation-form.component.scss'
})
export class ValidationFormComponent {
  constructor(private authService: AuthService, private fb: FormBuilder, private reportsService: ReportsService, private snackbarService: SnackbarService, private utilsService: UtilsService) { }

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

    for (const key in tags) {
      tags[key as keyof WebAppConfigTags].groups.forEach((group: TagGroup) => {
        this.processTags(baseForm, group, tags[key as keyof WebAppConfigTags].elements, true);
      });
    }

    return baseForm;
  }

  private processTags(baseForm: FormGroup, group: TagGroup, tags: Tag[], isTopLevel: boolean): void {
    tags.forEach((tag: Tag) => {
      if (group.id === tag.type) {
        this.addControlToGroup(baseForm, group, tag, isTopLevel);
        if (tag.subTags && tag.subTags.length > 0 && group.subGroup) {
          this.processTags(baseForm, group.subGroup, tag.subTags, false);
        }
      }
    });
  }

  private addControlToGroup(baseForm: FormGroup, group: TagGroup, tag: Tag, isTopLevel: boolean): void {
    let formGroup = baseForm.get(group.id) as FormGroup;
    if (!formGroup) {
      formGroup = this.fb.group({});
      baseForm.addControl(group.id, formGroup);
    }
    const control = new FormControl(false);
    if (!isTopLevel) {
      control.disable();
    }
    formGroup.addControl(tag.id, control);
  }

  public checkControls(groupKey: string): boolean {
    let foundGroup: FormGroup = this.fb.group({});

    Object.keys(this.baseForm.controls).forEach((key: string) => {
      if (key === groupKey) {
        let found: any = this.baseForm.get([`${key}`]);
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
        if (control.parent && (control.parent.get([`${id}`]) === control)) {
          if (control.parent instanceof FormGroup) {
            formGroup = control.parent;
          }
        }
      }
    }

    Object.keys(formGroup.controls).forEach((key: string) => {
      for (const id of ids) {
        if (id === key) {
          let foundControl: any = formGroup.get([`${key}`]);
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
            let foundControl: any = formControl.parent.get([`${key}`]);
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
        if (tag.id === id) {
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

        const formGroup: FormGroup = this.baseForm.get([`${key}`]) as FormGroup;

        if (formGroup) {
          values.forEach((value: string) => {

            for (const key in formGroup.controls) {
              if (value === key) formGroup.get([`${key}`])?.setValue(true);
            }
          });
        }
      }
    });
  }

  public async handleSubmit(): Promise<void> {
    if (!this.report) return;

    try {
      let data: any = {}
      let fields: any = {};

      data.priority = this.baseForm.value.priority.priority;
      fields = this.parseReportFields(this.baseForm.value);
      const { parentFields, childFields } = this.splitFields(fields);
      data.fields = parentFields;

      if (!this.report.isValidated) data.validated = true;
      if (!this.report.validationDate) data.validationDate = Timestamp.now();

      // const childReports: ReportChild[] = this.childrenReport.map((report: ReportChild) => ({ ...report, fields: { ...report.fields } }));
      const childReports: ReportChild[] = this.utilsService.deepClone(this.childrenReport);
      const currentTags: { [key: string]: string[] } = this.getCurrentChildrenTags(childReports);
      const tagChanges: TagChanges = this.compareTags(currentTags, childFields);

      console.log('Cambiamenti', tagChanges);

      if (Object.keys(tagChanges.toAdd).length !== 0) {
        console.log('Ci sono tag da aggiungere');
        this.createNewChildReport(childReports, tagChanges);
      }

      if (Object.keys(tagChanges.toRemove).length !== 0) {
        console.log('Ci sono tag da rimuovere');
        this.removeTags(childReports, tagChanges);
      }

      data.lastChildTime = Timestamp.now();
      await this.reportsService.setReportById(this.report.id, data);
      this.snackbarService.createSnackbar('Modifica salvato con successo', SNACKBARTYPE.Closable, SNACKBAROUTCOME.Success);
    } catch (error) {
      console.error(error);
      this.snackbarService.createSnackbar('C\'è stato un errore nel salvataggio. Riprovare.', SNACKBARTYPE.Closable, SNACKBAROUTCOME.Error);
    }
  }

  private parseReportFields(formValue: { [key: string]: any }): { [key: string]: any } {
    let fields: any = {}

    Object.keys(formValue).forEach((formKey: string) => {
      let values: string[] = [];
      for (const valueKey in formValue[formKey]) {
        if (formValue[formKey][valueKey]) {
          values.push(valueKey);
        }
      }
      fields[formKey] = values;
    });

    return fields;
  }

  private splitFields(fields: { [key: string]: any }): { parentFields: { [key: string]: string[] }, childFields: { [key: string]: string[] } } {
    let parentFields: { [key: string]: string[] } = {};
    let childFields: { [key: string]: string[] } = {};

    function recurse(group: TagGroup, array: TagGroup[]) {
      array.push(group);
      if (group.subGroup) recurse(group.subGroup, array);
    }

    let parentGroups: TagGroup[] = [];
    this.tags.parent.groups.forEach((group: TagGroup) => recurse(group, parentGroups));

    let childGroups: TagGroup[] = [];
    this.tags.child.groups.forEach((group: TagGroup) => recurse(group, childGroups));

    Object.keys(fields).forEach((key: string) => {
      parentGroups.forEach((group: TagGroup) => {
        if (group.id === key) {
          parentFields[key] = fields[key];
        }
      });

      childGroups.forEach((group: TagGroup) => {
        if (group.id === key) {
          childFields[key] = fields[key];
        }
      });
    });

    return { parentFields, childFields };
  }

  private getCurrentChildrenTags(reports: ReportChild[]): { [key: string]: string[] } {
    let currentTags: { [key: string]: Set<string> } = {};

    reports.forEach((report: ReportChild) => {
      for (const key in report.fields) {
        this.tagGroups.forEach((group: TagGroup) => {
          if (group.id !== key) return;
          if (!Array.isArray(report.fields[key])) return;
          let field: string[] = report.fields[key];
          if (!currentTags[key]) currentTags[key] = new Set<string>();
          field.forEach((tag: string) => currentTags[key].add(tag));
        });
      }
    });

    let currentTagsArray: { [key: string]: string[] } = {};
    for (const key in currentTags) {
      currentTagsArray[key] = Array.from(currentTags[key]);
    }

    return currentTagsArray;
  }

  private compareTags(currentTags: { [key: string]: string[] }, newTags: { [key: string]: string[] }): TagChanges {
    const toAdd: { [key: string]: string[] } = {};
    const toRemove: { [key: string]: string[] } = {};

    for (const key in currentTags) {
      if (!newTags.hasOwnProperty(key)) {
        toRemove[key] = currentTags[key];
      } else {
        const tagsToRemove = currentTags[key].filter(tag => !newTags[key].includes(tag));
        if (tagsToRemove.length > 0) {
          toRemove[key] = tagsToRemove;
        }
      }
    }

    for (const key in newTags) {
      if (!currentTags.hasOwnProperty(key)) {
        toAdd[key] = newTags[key];
      } else {
        const tagsToAdd = newTags[key].filter(tag => !currentTags[key].includes(tag));
        if (tagsToAdd.length > 0) {
          toAdd[key] = tagsToAdd;
        }
      }
    }

    Object.keys(toAdd).forEach(key => {
      if (toAdd[key].length === 0) {
        delete toAdd[key];
      }
    });

    Object.keys(toRemove).forEach(key => {
      if (toRemove[key].length === 0) {
        delete toRemove[key];
      }
    });

    return { toAdd, toRemove };
  }

  private createNewChildReport(reports: ReportChild[], changes: TagChanges) {
    if (!this.report) return;

    const newReport: any = {
      closure: false,
      creationTime: Timestamp.now(),
      fields: changes.toAdd,
      flowId: reports[reports.length - 1].flowId,
      language: LANGUAGE.Italian,
      parentId: this.report.id,
      userId: this.authService.loggedUser ? this.authService.loggedUser.id : 'web',
      verticalId: this.report.verticalId
    }

    let f: any = { ...newReport.fields };

    for (const key in f) {
      f[key] = f[key].map((tag: string) => tag);
    }

    newReport.fields = { ...f };

    console.log('Nuovo report', newReport);
    this.reportsService.addChildReport(newReport);
  }

  private removeTags(reports: ReportChild[], changes: TagChanges): void {
    reports.forEach((report: ReportChild) => {

      let r: any = {
        closure: report.isClosed ? report.isClosed : false,
        creationTime: report.creationTime,
        fields: report.fields,
        flowId: report.flowId,
        language: report.language,
        parentId: report.parentId,
        userId: this.authService.loggedUser ? this.authService.loggedUser.id : 'web',
        verticalId: this.report ? this.report.verticalId : VERTICAL.Default
      };

      for (const key in r.fields) {
        for (const k in changes.toRemove) {
          if (key !== k) continue;
          r.fields[key] = r.fields[key].filter((tag: string) => !changes.toRemove[k].includes(tag));
          r.fields[key] = r.fields[key].map((tag: string) => tag);
        }
      }

      Object.keys(r.fields).forEach(key => {
        if (r.fields[key].length === 0) {
          delete r.fields[key];
        }
      });
      this.reportsService.setChildReportById(report.id, r);
    });

    console.log('Reports', reports);
  }
}
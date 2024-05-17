import { Component, Injectable, WritableSignal, effect, signal } from '@angular/core';
import { VERTICAL } from '../models/app-flow.model';
import { DocumentReference, DocumentSnapshot, doc, getDoc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { Tag } from '../models/tag.model';
import { MobileAppConfigComponent, MobileAppMobileAppConfigComponentType, MobileAppConfigOption, WebAppConfig } from '../models/config.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  public config: WebAppConfig = WebAppConfig.createEmpty();
  public mobileAppConfig: any;
  public mobileAppConfigSignal: WritableSignal<any> = signal({});

  private _parentFlowTags: Tag[] = [];

  public get parentFlowTags(): Tag[] {
    return this._parentFlowTags;
  }

  public set parentFlowTags(tags: Tag[]) {
    this._parentFlowTags = tags;  
    this.parentFlowTagsSignal.set(tags);
  }

  public parentFlowTagsSignal: WritableSignal<Tag[]> = signal([]);

  private _childFlowTags: Tag[] = [];

  public get childFlowTags(): Tag[] {
    return this._childFlowTags;
  }

  public set childFlowTags(tags: Tag[]) {
    this._childFlowTags = tags;
    this.childFlowTagsSignal.set(tags);
  }

  public childFlowTagsSignal: WritableSignal<Tag[]> = signal([]);

  constructor(private db: Firestore) {
    effect(() => {
      if (!this.mobileAppConfigSignal().name) return;
      this.mobileAppConfig = this.mobileAppConfigSignal();
      if (!this.mobileAppConfig.parentFlows) return;
      if (!this.mobileAppConfig.childFlows) return;

      // console.log(this.mobileAppConfig);      
      // console.log(JSON.parse(this.mobileAppConfig.parentFlows.default));
      // console.log(JSON.parse(this.mobileAppConfig.childFlows.horizontal.flowJson));      

      let parentTags: Tag[] = [];
      for (const key in this.mobileAppConfig.parentFlows) {
        const component: MobileAppConfigComponent = JSON.parse(this.mobileAppConfig.parentFlows[key]);
        parentTags.push(...this.findTags(component));
      }
      parentTags = [...new Set(parentTags.filter((tag, index, array) => array.findIndex(t => t.equals(tag)) === index))];
      this.parentFlowTags = [...parentTags];

      this.config.tags.parent.label = parentTags[0].label;
      this.config.tags.parent.tags = [...parentTags];

      let childTags: Tag[] = [];
      for (const key in this.mobileAppConfig.childFlows) {
        const component: MobileAppConfigComponent = JSON.parse(this.mobileAppConfig.childFlows[key].flowJson);
        childTags.push(...this.findTags(component));
      }
      childTags = [...new Set(childTags.filter((tag, index, array) => array.findIndex(t => t.equals(tag)) === index))];
      this.childFlowTags = [...childTags];

      this.config.tags.child.label = childTags[0].label;
      this.config.tags.child.tags = [...childTags];

      // console.log(this.config);      
    }, { allowSignalWrites: true });
  }

  public async getVerticalConfig(vertical: VERTICAL): Promise<void> {
    const docRef: DocumentReference = doc(this.db, 'verticals', vertical);
    const docSnap: DocumentSnapshot = await getDoc(docRef);

    if (docSnap.exists()) {
      this.mobileAppConfigSignal.set(docSnap.data());
    } else {
      console.log('Configurazione inesistente.');
      console.log('Recupero configurazione generica.');
      const docRef: DocumentReference = doc(this.db, 'verticals', VERTICAL.Default);
      const docSnap: DocumentSnapshot = await getDoc(docRef);
      this.mobileAppConfigSignal.set(docSnap.data());
    }
  }

  public findTags(component: MobileAppConfigComponent): Tag[] {
    const result: Tag[] = [];

    if (component.component === MobileAppMobileAppConfigComponentType.Selection && component.options) {
      for (const option of component.options) {
        if (this.isMobileAppConfigOption(option)) {
          const tag: Tag = this.convertToTag(option, component.title || '', 1);
          if (!result.some(existingTag => existingTag.id === tag.id)) {
            result.push(tag);
          }
        }
      }
    }

    if (component.child) {
      result.push(...this.findTagsRecursive(component.child));
    }

    return result;
  }

  private findTagsRecursive(component: MobileAppConfigComponent): Tag[] {
    const result: Tag[] = [];
    if (component.options) {
      for (const option of component.options) {
        if (this.isMobileAppConfigOption(option)) {
          const tag: Tag = this.convertToTag(option, component.title || '', 1);
          if (!result.some(existingTag => existingTag.id === tag.id)) {
            result.push(tag);
          }
        } else if (this.isMobileAppConfigComponent(option)) {
          result.push(...this.findTagsRecursive(option));
        } else if (this.hasChildComponent(option)) {
          const childComponent = (option as MobileAppConfigComponent).child;
          if (childComponent) {
            result.push(...this.findTagsRecursive(childComponent));
          }
        }
      }
    }
    return result;
  }

  private isMobileAppConfigOption(obj: any): obj is MobileAppConfigOption {
    return 'id' in obj && 'name' in obj && !('component' in obj) && !('child' in obj);
  }

  private isMobileAppConfigComponent(obj: any): obj is MobileAppConfigComponent {
    return 'component' in obj;
  }

  private hasChildComponent(obj: any): obj is { child: MobileAppConfigComponent } {
    return 'child' in obj && obj.child !== undefined && this.isMobileAppConfigComponent(obj.child);
  }

  private convertToTag(option: MobileAppConfigOption, label: string, optionDepth: number): Tag {
    const { id, name, description } = option;
    const type = '';
    let tagOptions: any[] = [];
    if (option.options) {
      const newDepth = optionDepth + 1;     
      tagOptions = option.options.map((o: MobileAppConfigOption) => this.convertToTag(o, label, newDepth));
    }
    return new Tag(id, name, description || '', type, label, tagOptions, optionDepth);
  }
}
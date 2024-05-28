import { Component, Injectable, WritableSignal, effect, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { DocumentReference, DocumentSnapshot, doc, getDoc } from 'firebase/firestore';
import { VERTICAL } from '../models/app-flow.model';
import { Tag, TagGroup } from '../models/tag.model';
import { MobileAppConfigComponent, MobileAppMobileAppConfigComponentType, MobileAppConfigOption, WebAppConfig, WebAppConfigTags } from '../models/config.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  public config: WebAppConfig = WebAppConfig.createEmpty();
  public tags: Tag[] = [];
  public tagGroups: TagGroup[] = [];
  public parentTagGroups: TagGroup[] = [];
  public childTagGroups: TagGroup[] = [];

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

      // console.log('Mobile config:', this.mobileAppConfig);
      // console.log('Parent flow:', JSON.parse(this.mobileAppConfig.parentFlows.default));
      // console.log('Child flow:', JSON.parse(this.mobileAppConfig.childFlows.horizontal.flowJson));

      let parentTags: Tag[] = [];
      let parentTagGroups: TagGroup[] = [];
      for (const key in this.mobileAppConfig.parentFlows) {
        const component: MobileAppConfigComponent = JSON.parse(this.mobileAppConfig.parentFlows[key]);
        parentTags.push(...this.searchTags(component));
        parentTagGroups.push(...this.searchTagGroups(component));
      }

      parentTags = this.removeDuplicatedTags(parentTags);
      parentTagGroups = this.removeDuplicatedTagGroups(parentTagGroups);

      this.parentFlowTags = [...parentTags];

      // console.log('Parent tags:', parentTags);
      // console.log('Parent tag groups:', parentTagGroups);

      let childTags: Tag[] = [];
      let childTagGroups: TagGroup[] = [];
      for (const key in this.mobileAppConfig.childFlows) {
        const component: MobileAppConfigComponent = JSON.parse(this.mobileAppConfig.childFlows[key].flowJson);
        childTags.push(...this.searchTags(component));
        childTagGroups.push(...this.searchTagGroups(component));
      }

      childTags = this.removeDuplicatedTags(childTags);
      childTagGroups = this.removeDuplicatedTagGroups(childTagGroups);

      this.childFlowTags = [...childTags];

      // console.log('Child tags:', childTags);      
      // console.log('Child tag groups', childTagGroups);

      this.config.tags.parent.elements = [...parentTags];
      this.config.tags.parent.groups = [...parentTagGroups];
      this.config.tags.child.elements = [...childTags];
      this.config.tags.child.groups = [...childTagGroups];

      console.log('Web config:', this.config);

      this.tags = this.flatTags(this.config.tags);

      const { flatTagGroups, flatParentTagGroups, flatChildTagGroups } = this.flatTagGroups(this.config.tags);
      this.tagGroups = flatTagGroups;
      this.parentTagGroups = flatParentTagGroups;
      this.childTagGroups = flatChildTagGroups;
      
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

  private searchTags(component: MobileAppConfigComponent): Tag[] {
    let results: any[] = [];

    if (component.component === MobileAppMobileAppConfigComponentType.Selection && component.options) {
      results = this.parseTags(component);
    }

    if (component.child) {
      results = [...results, ...this.searchTags(component.child)];

    } else if (component.component === MobileAppMobileAppConfigComponentType.Branch && component.options) {
      results = [...results, ...component.options.map((o: any) => new Tag(o.id, o.name, '', component.id, [])), ...component.options.flatMap((o: any) => this.searchTags(o.child))];
    }

    return results;
  }

  private parseTags(component: any): any {
    return component.options.map((o: any) => new Tag(o.id, o.name, o.description, component.id, o.options ? o.options.map((obj: any) => this.parseSubTags(component.subLevels, 0, obj)) : []));
  }

  private parseSubTags(subLevels: any[], index: number = 0, option: MobileAppConfigOption): any {
    const newIndex: number = index + 1;
    const subTags: Tag = new Tag(
      option.id,
      option.name,
      option.description || '',
      subLevels[index].id,
      subLevels[newIndex] ? (option.options ? option.options.map((o: any) => this.parseSubTags(subLevels, newIndex, o)) : []) : []);
    return subTags;
  }

  private removeDuplicatedTags(tags: Tag[]): Tag[] {
    return Object.values(tags.reduce((a: any, c) => { a[(c.id)] = c; return a }, {}));
  }

  private removeDuplicatedTagGroups(tagGroups: TagGroup[]): TagGroup[] {
    return Object.values(tagGroups.reduce((a: any, c) => { a[(c.id)] = c; return a }, {}));
  }

  private searchTagGroups(component: MobileAppConfigComponent): TagGroup[] {
    let results: any[] = [];

    if (component.component === MobileAppMobileAppConfigComponentType.Selection && component.options) {
      results = [this.parseGroups(component)];
    }

    if (component.child) {
      results = [...results, ...this.searchTagGroups(component.child)];

    } else if (component.component === MobileAppMobileAppConfigComponentType.Branch && component.options) {
      results = [...results, new TagGroup(component.id, component.title || '', null), ...component.options.flatMap((o: any) => this.searchTagGroups(o.child))];
    }

    return results;
  }

  private parseGroups(component: MobileAppConfigComponent): any {
    return new TagGroup(component.id, component.title || '', component.subLevels && component.subLevels.length > 0 ? this.parseSubGroup(component.subLevels) : null)
  }

  private parseSubGroup(subLevels: any[], index: number = 0): TagGroup {
    const newIndex: number = index + 1;
    return new TagGroup(subLevels[index].id, subLevels[index].title, subLevels[newIndex] ? this.parseSubGroup(subLevels, newIndex) : null);
  }

  private createTag(option: MobileAppConfigOption): any {
    const { id, name, description } = option;
    let tagOptions: any[] = [];
    if (option.options) tagOptions = option.options.map((o: MobileAppConfigOption) => this.createTag(o));
    return { id, name, description, options: tagOptions };
  }

  private flatTags(configTags: WebAppConfigTags): Tag[] {
    const allTags: Tag[] = [];

    function recurse(tags: Tag[]) {
      for (const tag of tags) {
        allTags.push(tag);

        if (tag.subTags && tag.subTags.length > 0) {
          recurse(tag.subTags);
        }
      }
    }

    if (configTags.parent && configTags.parent.elements) {
      recurse(configTags.parent.elements);
    }

    if (configTags.child && configTags.child.elements) {
      recurse(configTags.child.elements);
    }

    return allTags;
  }


  flatTagGroups(configTags: WebAppConfigTags): { flatTagGroups: TagGroup[], flatParentTagGroups: TagGroup[], flatChildTagGroups: TagGroup[] } {
    const flatTagGroups: TagGroup[] = [];
    const flatParentTagGroups: TagGroup[] = [];
    const flatChildTagGroups: TagGroup[] = [];

    function recurse(group: TagGroup, targetArray: TagGroup[]) {
      targetArray.push(group);
      if (group.subGroup) {
        recurse(group.subGroup, targetArray);
      }
    }

    if (configTags.parent && Array.isArray(configTags.parent.groups)) {
      configTags.parent.groups.forEach((group: TagGroup) => {
        recurse(group, flatParentTagGroups);
      });
      flatTagGroups.push(...flatParentTagGroups);
    }

    if (configTags.child && Array.isArray(configTags.child.groups)) {
      configTags.child.groups.forEach((group: TagGroup) => {
        recurse(group, flatChildTagGroups);
      });
      flatTagGroups.push(...flatChildTagGroups);
    }

    return {
      flatTagGroups,
      flatParentTagGroups,
      flatChildTagGroups
    };
  }
}
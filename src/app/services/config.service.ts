import { Injectable, Signal, WritableSignal, computed, effect, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { DocumentReference, DocumentSnapshot, GeoPoint, doc, getDoc } from 'firebase/firestore';
import { VERTICAL } from '../models/vertical.model';
import { Tag, TagGroup } from '../models/tag.model';
import { MobileAppConfigComponent, MobileAppMobileAppConfigComponentType, MobileAppConfigOption, WebAppConfig, WebAppConfigTags } from '../models/config.model';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ThemeService } from './theme.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  public config: WebAppConfig = WebAppConfig.createDefault();
  public configSignal: WritableSignal<WebAppConfig> = signal(WebAppConfig.createDefault());

  public mobileAppConfig: any;
  public mobileAppConfigSignal: WritableSignal<any> = signal({});

  public tags: Tag[] = [];
  public tagGroups: TagGroup[] = [];

  public parentTagGroups: TagGroup[] = [];
  public parentTagGroupsSignal: Signal<TagGroup[]> = computed(() => {
    const config: WebAppConfig = this.configSignal();
    const { flatTagGroups, flatParentTagGroups, flatChildTagGroups } = this.flatTagGroups(config.tags);
    return flatParentTagGroups;
  });

  public childTagGroups: TagGroup[] = [];
  public childTagGroupsSignal: Signal<TagGroup[]> = computed(() => {
    const config: WebAppConfig = this.configSignal();
    const { flatTagGroups, flatParentTagGroups, flatChildTagGroups } = this.flatTagGroups(config.tags);
    return flatChildTagGroups;
  });

  constructor(private db: Firestore, private http: HttpClient, private themeService: ThemeService) {
    effect(() => {
      if (this.configSignal().name === 'MUST') return;
      this.config = this.configSignal();
      this.themeService.setTheme(this.config.style);

      this.tags = this.flatTags(this.config.tags);
      const { flatTagGroups, flatParentTagGroups, flatChildTagGroups } = this.flatTagGroups(this.config.tags);
      this.tagGroups = flatTagGroups;
    });
  }

  public async getVerticalConfig(vertical: VERTICAL): Promise<void> {
    const docRef: DocumentReference = doc(this.db, 'verticals', vertical);
    const docSnap: DocumentSnapshot = await getDoc(docRef);

    if (docSnap.exists()) {
      this.generateWebAppConfig(docSnap.data(), vertical);
    } else {
      console.log('Configurazione inesistente.');
      console.log('Recupero configurazione generica.');
      const docRef: DocumentReference = doc(this.db, 'verticals', VERTICAL.Default);
      const docSnap: DocumentSnapshot = await getDoc(docRef);
      this.generateWebAppConfig(docSnap.data(), vertical);
    }
  }

  public async generateWebAppConfig(mobileAppConfig: any, vertical: VERTICAL): Promise<void> {
    // console.log('MOBILE CONFIG:', mobileAppConfig);

    let parentTags: Tag[] = [];
    let parentTagGroups: TagGroup[] = [];

    for (const key in mobileAppConfig.parentFlows) {
      const component: MobileAppConfigComponent = await this.checkConfigType(mobileAppConfig.parentFlows[key]);
      parentTags.push(...this.searchTags(component));
      parentTagGroups.push(...this.searchTagGroups(component));
    }

    parentTags = this.removeDuplicatedTags(parentTags);
    parentTagGroups = this.removeDuplicatedTagGroups(parentTagGroups);

    let childTags: Tag[] = [];
    let childTagGroups: TagGroup[] = [];
    for (const key in mobileAppConfig.childFlows) {
      const component: MobileAppConfigComponent = await this.checkConfigType(mobileAppConfig.childFlows[key]);
      childTags.push(...this.searchTags(component));
      childTagGroups.push(...this.searchTagGroups(component));
    }

    childTags = this.removeDuplicatedTags(childTags);
    childTagGroups = this.removeDuplicatedTagGroups(childTagGroups);

    const settings: any = await new Promise((resolve, reject) => {
      this.getAppSettings(vertical)
        .subscribe({
          next: (data: any) => resolve(data),
          error: (error: any) => reject(error)
        });
    });

    const config: WebAppConfig = WebAppConfig.createDefault();

    config.id = vertical;
    if (mobileAppConfig.name) config.name = mobileAppConfig.name;
    if (settings.position) {
      config.position = {
        location: new GeoPoint(settings.position.location[0], settings.position.location[1]),
        zoom: settings.position.zoom
      }
    }
    if (mobileAppConfig.splashLogoUrl) config.assets.logoUrl = mobileAppConfig.splashLogoUrl;
    if (settings.style) config.style = settings.style;
    if (settings.labels) config.labels = settings.labels;
    if (settings.components) config.components = [...settings.components];
    config.tags = {
      parent: {
        elements: [...parentTags],
        groups: [...parentTagGroups]
      },
      child: {
        elements: [...childTags],
        groups: [...childTagGroups]
      }
    }

    console.log('WEB CONFIG:', config);

    this.configSignal.set(config);
  }

  public getAppSettings(app: VERTICAL): Observable<any> {
    return this.http.get<any>('./assets/settings/settings.json').pipe(
      map(res => {
        let allSettings: any[] = res.apps;
        let appSettings: any | undefined = allSettings.find((item: any) => item.id === app);
        if (!appSettings) appSettings = allSettings[0];
        return appSettings;
      })
    );
  }

  private async checkConfigType(flows: any): Promise<MobileAppConfigComponent> {
    let flow: any;

    try {
      flow = JSON.parse(flows);
    } catch (error) {
      flow = null;
    }

    if (!flow) {
      for (const key in flows) {
        if (Object.prototype.hasOwnProperty.call(flows, key)) {

          for (const src in flows) {
            switch (src) {
              case 'flowJson':
                if (!flows[src]) continue;
                flow = JSON.parse(flows[src]);
                break;

              case 'flowUrl':
                if (!flows[src]) continue;
                let d: any = await fetch(flows[src]);
                flow = await d.json();
                break;

              default:
                break;
            }
          }
        }
      }
    }

    return flow;
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

  public flatTags(configTags: WebAppConfigTags): Tag[] {
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
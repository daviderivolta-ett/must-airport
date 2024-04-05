import { Injectable, WritableSignal, effect, signal } from '@angular/core';
import { VERTICAL } from '../models/app-flow.model';
import { DocumentReference, DocumentSnapshot, doc, getDoc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { Tag } from '../models/tag.model';
import { TechElementTag } from '../models/tech-element-tag.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  public config: any;
  public configSignal: WritableSignal<any> = signal({});

  constructor(private db: Firestore) {
    effect(() => {
      if (!this.configSignal().name) return;
      this.config = this.configSignal();
      if (!this.config.parentFlows) return;
      if (!this.config.childFlows) return;
      console.log(this.config);
      // console.log(JSON.parse(this.config.parentFlows.default));
      // console.log(JSON.parse(this.config.childFlows.vertical.flowJson));

      let parentFlowTags: Tag[] = [];
      for (const key in this.config.parentFlows) {
        const tags: Tag[] = this.getTags(JSON.parse(this.config.parentFlows[key]));
        parentFlowTags.push(...tags);
      }
      console.log(parentFlowTags);
      
      let childFlowTags: Tag[] = [];
      for (const key in this.config.childFlows) {
        const tags: Tag[] = this.getTags(JSON.parse(this.config.childFlows[key].flowJson));
        childFlowTags.push(...tags);
      }
      console.log(childFlowTags);
    });
  }

  public async getVerticalConfig(vertical: VERTICAL): Promise<void> {
    const docRef: DocumentReference = doc(this.db, 'verticals', vertical);
    const docSnap: DocumentSnapshot = await getDoc(docRef);

    if (docSnap.exists()) {
      this.configSignal.set(docSnap.data());
    } else {
      console.log('Configurazione inesistente.');
      console.log('Recupero configurazione generica.');
      const docRef: DocumentReference = doc(this.db, 'verticals', VERTICAL.Default);
      const docSnap: DocumentSnapshot = await getDoc(docRef);
      this.configSignal.set(docSnap.data());
    }
  }

  public getTags(object: any): Tag[] {
    let allTagsSet: Set<Tag> = new Set();

    switch (object['component']) {
      case 'selection':
        const options: any[] = object['options'];
        const subLevels: any[] = object['subLevels'];
        const tagType: string = object['id'];
        let tags: Tag[] = options.map((option: any) => {
          const tag: Tag = this.parseTag(option, tagType);

          if (subLevels && subLevels.length > 0) {
            subLevels.forEach((sub: any) => {
              tag.options.forEach((subOption: any) => {
                subOption.type = sub.id;
              })
            });
          }

          return tag;
        });
        tags.forEach(tag => allTagsSet.add(tag));
        break;

      case 'branch':
        if (object['options']) {
          const options: any[] = object['options'];
          options.forEach((option: any) => {
            const branchTags = this.getTags(option);
            branchTags.forEach(tag => allTagsSet.add(tag));
          });
        }
        break;

      default:
        if (object['child']) {
          const child: any = object['child'];
          const childTags = this.getTags(child);
          childTags.forEach(tag => allTagsSet.add(tag));
        }
        break;
    }

    return Array.from(allTagsSet);
  }

  private parseTag(tagDb: any, type: string = ''): Tag {
    let tag: Tag = Tag.createEmpty();

    tag.id = tagDb.id;
    tag.name = tagDb.name;
    tag.description = tagDb.description;
    tag.type = type;
    if (tagDb.options && tagDb.options.length !== 0) {
      tag.options = tagDb.options.map((tag: any) => {
        return this.parseTag(tag, type);
      });
    }

    return tag;
  }
}
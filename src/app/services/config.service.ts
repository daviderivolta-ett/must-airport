import { Injectable, WritableSignal, effect, signal } from '@angular/core';
import { VERTICAL } from '../models/app-flow.model';
import { DocumentReference, DocumentSnapshot, doc, getDoc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { Tag } from '../models/tag.model';

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
      if (!this.config.parentFlows.default) return;
      // this.getAllTags(JSON.parse(this.config.parentFlows.default));
      console.log(JSON.parse(this.config.parentFlows.default));
      let tags: Tag[] = this.getTags(JSON.parse(this.config.parentFlows.default));
      console.log(tags);
    });
  }

  public async getVerticalConfig(vertical: VERTICAL): Promise<void> {
    const docRef: DocumentReference = doc(this.db, 'verticals', vertical);
    const docSnap: DocumentSnapshot = await getDoc(docRef);

    if (docSnap.exists()) {
      this.configSignal.set(docSnap.data());
    } else {
      console.log('Configurazione inesistente');
    }
  }

  public getAllTags(config: any): void {
    let tags: any[] = [];
    console.log(config);
    if (!config.child) return;
    let child: any = config.child;
    if (!child.options || child.options.length === 0) return;
    let options: any[] = child.options;
    options.map(option => {
      if (!option.child) return;
      let c: any = option.child;
      if (!c.options || c.options.length === 0) return;
      c.options.map((option: any) => {
        tags.push(option);
      });
    });
    let parsedTags: any[] = tags.map(tag => {
      return this.parseTag(tag);
    });
    console.log(parsedTags);
  }

  public getTags(object: any): Tag[] {
    let allTagsSet: Set<Tag> = new Set();

    switch (object['component']) {
      case 'selection':
        const options: any[] = object['options'];
        const tagType: string = object['id'];
        let tags: Tag[] = options.map((option: any) => this.parseTag(option, tagType));
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


  public parseTag(tagDb: any, type: string = ''): Tag {
    let tag: Tag = Tag.createEmpty();

    tag.id = tagDb.id;
    tag.name = tagDb.name;
    tag.description = tagDb.description;
    tag.type = type;
    if (tagDb.options && tagDb.options.length !== 0) {
      tag.options = tagDb.options;
      tag.options = tag.options.map((tag: any) => {
        return this.parseTag(tag);
      });
    }

    return tag;
  }
}
import { Injectable, WritableSignal, effect, signal } from '@angular/core';
import { TechElementTag } from '../models/tech-element-tag.model';
import { Firestore } from '@angular/fire/firestore';
import { collection, getDocs, query } from 'firebase/firestore';
import { TechElementSubTag } from '../models/tech-element-subtag.model';

interface TechElementTagDb {
  categoryID: string;
  description: string;
  descriptionEN: string;
  id: string;
  name: string;
  nameEN: string;
  subCategoryID: string;
  subTags: any[];
}

interface TechElementSubTagDb {
  description: string;
  descriptionEN: string;
  id: string;
  name: string;
  nameEN: string;
}

@Injectable({
  providedIn: 'root'
})
export class TechElementsService {
  private techElementTagsSignal: WritableSignal<TechElementTag[]> = signal([]);
  public techElementTags: TechElementTag[] = [];

  constructor(private db: Firestore) {
    this.getAllTechElementTags();
    
    effect(() => {
      this.techElementTags = this.techElementTagsSignal();      
      console.log(this.getTechElementTagById('cte01.01.01'));
      console.log(this.getTechElementSubTagById('cte01.01.01.07'));
    });
  }

  public async getAllTechElementTags() {
    const q = query(collection(this.db, 'tagsTechElement'));
    const snapshot = await getDocs(q);
    let techElementTags: any[] = [];
    snapshot.forEach(doc => {
      techElementTags.push(this.parseTechElementTag(doc.data() as TechElementTagDb));
    });

    techElementTags = techElementTags.map(techElementTag => {
      techElementTag.subTags = techElementTag.subTags.map((subTag: TechElementSubTagDb) => {
        return this.parseTechEleementSubTag(subTag);
      });
      return techElementTag;
    });

    this.techElementTagsSignal.set(techElementTags);
  }

  private parseTechElementTag(techElementTag: TechElementTagDb): TechElementTag {
    let t = TechElementTag.createEmpty();

    t.categoryId = techElementTag.categoryID;
    t.description = { it: techElementTag.description, en: techElementTag.descriptionEN };
    t.id = techElementTag.id;
    t.name = { it: techElementTag.name, en: techElementTag.nameEN };
    t.subCategoryId = techElementTag.subCategoryID;
    t.subTags = techElementTag.subTags;

    return t;
  }

  private parseTechEleementSubTag(techElementSubTag: TechElementSubTagDb): TechElementSubTag {
    let t = TechElementSubTag.createEmpty();

    t.description = { it: techElementSubTag.description, en: techElementSubTag.descriptionEN };
    t.id = techElementSubTag.id;
    t.name = { it: techElementSubTag.name, en: techElementSubTag.nameEN };

    return t;
  }

  public getTechElementTagById(id: string): TechElementTag {
    let tag: TechElementTag = TechElementTag.createEmpty();
    this.techElementTags.forEach(techElementTag => {
      if (techElementTag.id === id) tag = techElementTag;
    });
    return tag;
  }

  public getTechElementSubTagById(id: string): TechElementSubTag {
    let tag: TechElementSubTag = TechElementSubTag.createEmpty();
    this.techElementTags.forEach(techElementTag => {
      if (techElementTag.subTags.length === 0) return;
      techElementTag.subTags.forEach((subTag: TechElementSubTag) => {
        if (subTag.id === id) tag = subTag;
      });
    });
    return tag;
  }
}

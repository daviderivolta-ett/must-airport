import { Injectable, WritableSignal, effect, signal } from '@angular/core';
import { TechElementTag } from '../models/tech-element-tag.model';
import { Firestore, getDocs, query, collection } from '@angular/fire/firestore';
import { TechElementSubTag } from '../models/tech-element-subtag.model';
import { FailureTag } from '../models/failure-tag.model';
import { FailureSubTag } from '../models/failure-subtag.model';

interface TechElementCategoryDb {
  id: string;
  name: string;
  subCategories: TechElementSubCategoryDb[];
}

interface TechElementSubCategoryDb {
  id: string;
  name: string;
}

interface TechElementTagDb {
  categoryID: string;
  description: string;
  descriptionEN: string;
  id: string;
  name: string;
  nameEN: string;
  subCategoryID: string;
  subTags: TechElementSubTagDb[];
}

interface TechElementSubTagDb {
  description: string;
  descriptionEN: string;
  id: string;
  name: string;
  nameEN: string;
}

interface FailureTagDb {
  categoryID: string;
  description: string;
  descriptionEN: string;
  id: string;
  imageUrls: string[];
  name: string;
  nameEN: string;
  subTags: FailureSubTagDb[];
}

interface FailureSubTagDb {
  description: string;
  descriptionEN: string;
  id: string;
  name: string;
  nameEN: string;
}

@Injectable({
  providedIn: 'root'
})
export class DictionaryService {
  public techElementTags: TechElementTag[] = [];
  public techElementTagsSignal: WritableSignal<TechElementTag[]> = signal([]);
  public techElementSubTagsSignal: WritableSignal<TechElementSubTag[]> = signal([]);
  public failureTagsSignal: WritableSignal<FailureTag[]> = signal([]);
  public failureSubTags: WritableSignal<FailureSubTag[]> = signal([]);
  public allLoaded: boolean = false;

  constructor(private db: Firestore) {
    effect(() => this.techElementTags = this.techElementTagsSignal());
  }

  public async getAll() {
    if (this.allLoaded) return;
    const requests = [this.getAllTechElementTags(), this.getAllFailureTags()];
    await Promise.all(requests)
      .then(res => {
        this.allLoaded = true;
        // console.log(res);
        // console.log(this.techElementTagsSignal());
        // console.log(this.failureTagsSignal());
        this.getAllTechElementSubTags();
        // console.log(this.techElementSubTagsSignal());
        
      });
  }

  public async getAllTechElementTags() {
    const qv = query(collection(this.db, 'tagsTechElement'));
    const qh = query(collection(this.db, 'tagsTechElementOriz'));

    try {
      const [snapshotV, snapshotH] = await Promise.all([getDocs(qv), getDocs(qh)]);

      const techElementTagsV = snapshotV.docs.map(doc => {
        const techElementTag = this.parseTechElementTag(doc.data() as TechElementTagDb);
        techElementTag.subTags = techElementTag.subTags.map((subTag: TechElementSubTagDb) => {
          return this.parseTechElementSubTag(subTag);
        });
        return techElementTag;
      });

      const techElementTagsH = snapshotH.docs.map(doc => {
        const techElementTag = this.parseTechElementTag(doc.data() as TechElementTagDb);
        techElementTag.subTags = techElementTag.subTags.map((subTag: TechElementSubTagDb) => {
          return this.parseTechElementSubTag(subTag);
        });
        return techElementTag;
      });

      this.techElementTagsSignal.set([...techElementTagsV, ...techElementTagsH]);
      return this.techElementTagsSignal;

    } catch (error) {
      console.error('Errore durante il recupero dei dati:', error);
      throw error;
    }
  }

  public async getAllTechElementSubTags() {
    let foundSubTags: TechElementSubTag[] = [];
    this.techElementTags.map(tag => tag.subTags.map((subTag: TechElementSubTag) => foundSubTags.push(subTag)));
    let subTags : TechElementSubTag[] = [];
    foundSubTags.forEach(t => {
      if (subTags.some((obj: TechElementSubTag) => obj.id === t.id)) return;
      subTags.push(t);
    })   
    this.techElementSubTagsSignal.set(subTags);
    return this.techElementSubTagsSignal;
  }

  public async getAllFailureTags() {
    const q = query(collection(this.db, 'tagsFailure'));

    try {
      const snapshot = await getDocs(q);
      this.failureTagsSignal.set(snapshot.docs.map(doc => {
        const failureTag = this.parseFailureTag(doc.data() as FailureTagDb);
        failureTag.subTags = failureTag.subTags.map((subTag: FailureSubTagDb) => {
          return this.parseFailureSubTag(subTag);
        });
        return failureTag;
      }));
      return this.failureTagsSignal;

    } catch (error) {
      console.error('Errore durante il recupero dei dati:', error);
      throw error;
    }
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

  private parseTechElementSubTag(techElementSubTag: TechElementSubTagDb): TechElementSubTag {
    let t = TechElementSubTag.createEmpty();

    t.description = { it: techElementSubTag.description, en: techElementSubTag.descriptionEN };
    t.id = techElementSubTag.id;
    t.name = { it: techElementSubTag.name, en: techElementSubTag.nameEN };

    return t;
  }

  public getTechElementTagById(id: string): TechElementTag {
    let tag: TechElementTag = TechElementTag.createEmpty();
    this.techElementTagsSignal().forEach(techElementTag => {
      if (techElementTag.id === id) tag = techElementTag;
    });
    return tag;
  }

  public getTechElementSubTagById(id: string): TechElementSubTag {
    let tag: TechElementSubTag = TechElementSubTag.createEmpty();
    this.techElementTagsSignal().forEach(techElementTag => {
      if (techElementTag.subTags.length === 0) return;
      techElementTag.subTags.forEach((subTag: TechElementSubTag) => {
        if (subTag.id === id) tag = subTag;
      });
    });
    return tag;
  }

  // public async getAllFailureTags() {
  //   const q = query(collection(this.db, 'tagsFailure'));
  //   const snapshot = await getDocs(q);
  //   // let failureTags: any[] = [];
  //   snapshot.forEach(doc => {
  //     this.failureTags.push(this.parseFailureTag(doc.data() as FailureTagDb));
  //   });

  //   this.failureTags = this.failureTags.map(failureTag => {
  //     failureTag.subTags = failureTag.subTags.map((subTag: FailureSubTagDb) => {
  //       return this.parseFailureSubTag(subTag);
  //     });
  //     return failureTag;
  //   });

  //   return this.failureTags;
  // }

  private parseFailureTag(failureTag: FailureTagDb): FailureTag {
    let f = FailureTag.createEmpty();

    f.categoryId = failureTag.categoryID;
    f.description = { it: failureTag.description, en: failureTag.descriptionEN };
    f.id = failureTag.id;
    f.imageUrls = failureTag.imageUrls;
    f.name = { it: failureTag.name, en: failureTag.nameEN };
    f.subTags = failureTag.subTags;

    return f;
  }

  private parseFailureSubTag(failureSubTag: FailureSubTagDb): FailureSubTag {
    let f = FailureSubTag.createEmpty();

    f.description = { it: failureSubTag.description, en: failureSubTag.descriptionEN };
    f.id = failureSubTag.id;
    f.name = { it: failureSubTag.name, en: failureSubTag.nameEN };

    return f;
  }

  public getFailureTagById(id: string): FailureTag {
    let tag: FailureTag = FailureTag.createEmpty();
    this.failureTagsSignal().forEach(failureTag => {
      if (failureTag.id === id) tag = failureTag;
    });
    return tag;
  }

  public getFailureSubTagById(id: string): FailureSubTag {
    let tag: FailureSubTag = FailureSubTag.createEmpty();
    this.failureTagsSignal().forEach(failureTag => {
      if (failureTag.subTags.length === 0) return;
      failureTag.subTags.forEach((subTag: FailureSubTag) => {
        if (subTag.id === id) tag = subTag;
      });
    });
    return tag;
  }
}
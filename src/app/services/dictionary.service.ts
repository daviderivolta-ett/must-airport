import { Injectable } from '@angular/core';
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
  public failureTags: FailureTag[] = [];
  public allLoaded: boolean = false;

  constructor(private db: Firestore) { }

  public async getAll() {
    if (this.allLoaded) return;
    const requests = [this.getAllTechElementTags(), this.getAllFailureTags()];
    await Promise.all(requests)
      .then(res => {
        this.allLoaded = true;
        // console.log(res);
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

      this.techElementTags = [...techElementTagsV, ...techElementTagsH];
      return this.techElementTags;

    } catch (error) {
      console.error('Errore durante il recupero dei dati:', error);
      throw error;
    }
  }

  // public async getAllTechElementTags() {
  //   const q = query(collection(this.db, 'tagsTechElement'));
  //   return await getDocs(q)
  //     .then(snapshot => {
  //       snapshot.forEach(doc => {
  //         this.techElementTags.push(this.parseTechElementTag(doc.data() as TechElementTagDb));
  //       });

  //       this.techElementTags = this.techElementTags.map(techElementTag => {
  //         techElementTag.subTags = techElementTag.subTags.map((subTag: TechElementSubTagDb) => {
  //           return this.parseTechElementSubTag(subTag);
  //         });
  //         return techElementTag;
  //       });
  //     })
  // }

  public async getAllFailureTags() {
    const q = query(collection(this.db, 'tagsFailure'));

    try {
      const snapshot = await getDocs(q);
      this.failureTags = snapshot.docs.map(doc => {
        const failureTag = this.parseFailureTag(doc.data() as FailureTagDb);
        failureTag.subTags = failureTag.subTags.map((subTag: FailureSubTagDb) => {
          return this.parseFailureSubTag(subTag);
        });
        return failureTag;
      });
      return this.failureTags;

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
    this.failureTags.forEach(failureTag => {
      if (failureTag.id === id) tag = failureTag;
    });
    return tag;
  }

  public getFailureSubTagById(id: string): FailureSubTag {
    let tag: FailureSubTag = FailureSubTag.createEmpty();
    this.failureTags.forEach(failureTag => {
      if (failureTag.subTags.length === 0) return;
      failureTag.subTags.forEach((subTag: FailureSubTag) => {
        if (subTag.id === id) tag = subTag;
      });
    });
    return tag;
  }
}
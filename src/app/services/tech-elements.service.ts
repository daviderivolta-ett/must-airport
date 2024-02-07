import { Injectable } from '@angular/core';
import { TechElementTag } from '../models/tech-element-tag.model';
import { Firestore } from '@angular/fire/firestore';
import { collection, getDocs, query } from 'firebase/firestore';
import { TechElementSubTag } from '../models/tech-element-subtag.model';
import { TechElementCategory } from '../models/tech-element-category.model';
import { TechElementSubCategory } from '../models/tech-element-subcategory.model';

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

@Injectable({
  providedIn: 'root'
})
export class TechElementsService {
  public techElementTags: TechElementTag[] = [];
  public allLoaded: boolean = false;

  constructor(private db: Firestore) { }

  public async getAll() {
    if (this.allLoaded) return;
    const requests = [this.getAllTechElementTags()];
    await Promise.all(requests)
      .then(res => {
        this.allLoaded = true;
        console.log(res);
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

  // public async getAllTechElementCategories() {
  //   const q = query(collection(this.db, 'categoriesTechElement'));
  //   const snapshot = await getDocs(q);
  //   let techElementCategories: any[] = [];
  //   snapshot.forEach(doc => {
  //     techElementCategories.push(this.parseTechElementCategory(doc.data() as TechElementCategoryDb));
  //   });
  //   techElementCategories = techElementCategories.map(techElementCategory => {
  //     techElementCategory.subCategories = techElementCategory.subCategories.map((subCategory: TechElementSubCategoryDb) => {
  //       return this.parseTechElementSubCategory(subCategory);
  //     });
  //     return techElementCategory;
  //   });
  //   this.techElementCategoriesSignal.set(techElementCategories);
  // }

  private parseTechElementCategory(techElementCategory: TechElementCategoryDb): TechElementCategory {
    let t = TechElementCategory.createEmpty();

    t.id = techElementCategory.id;
    t.name = techElementCategory.name;
    t.subCategories = techElementCategory.subCategories;

    return t;
  }

  private parseTechElementSubCategory(techElementSubCategory: TechElementSubCategoryDb): TechElementSubCategory {
    let t = TechElementSubCategory.createEmpty();

    t.id = techElementSubCategory.id;
    t.name = techElementSubCategory.name;

    return t;
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

  // public getTechElementCategoryById(id: string): TechElementCategory {
  //   let category: TechElementCategory = TechElementCategory.createEmpty();
  //   this.techElementCategories.forEach(techElementCategory => {
  //     if (techElementCategory.id === id) category = techElementCategory;
  //   });
  //   return category;
  // }

  // public getTechElementSubCategoryById(id: string): TechElementSubCategory {
  //   let category: TechElementSubCategory = TechElementSubCategory.createEmpty();
  //   this.techElementCategories.forEach(techElementCategory => {
  //     if (techElementCategory.subCategories.length === 0) return;
  //     techElementCategory.subCategories.forEach((subCategory: TechElementSubCategory) => {
  //       if (subCategory.id === id) category = subCategory;
  //     });
  //   });
  //   return category;
  // }
}

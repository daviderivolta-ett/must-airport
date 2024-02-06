import { Injectable, WritableSignal, effect, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { collection, getDocs, query } from 'firebase/firestore';
import { FailureTag } from '../models/failure-tag.model';
import { FailureSubTag } from '../models/failure-subtag.model';

interface FailureTagDb {
  categoryID: string;
  description: string;
  descriptionEN: string;
  id: string;
  imageUrls: string[];
  name: string;
  nameEN: string;
  subTags: any;
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
export class FailuresService {
  private failureTagsSignal: WritableSignal<FailureTag[]> = signal([]);
  public failureTags: FailureTag[] = [];

  constructor(private db: Firestore) {
    this.getAllFailureTags();

    effect(() => {
      this.failureTags = this.failureTagsSignal();
      // console.log(this.failureTags);
      // console.log(this.getFailureSubTagById('cf01.01.02'));
      // console.log(this.getFailureTagById('cf02.03'));      
    });
  }

  public async getAllFailureTags() {
    const q = query(collection(this.db, 'tagsFailure'));
    const snapshot = await getDocs(q);
    let failureTags: any[] = [];
    snapshot.forEach(doc => {
      failureTags.push(this.parseFailureTag(doc.data() as FailureTagDb));
    });

    failureTags = failureTags.map(failureTag => {
      failureTag.subTags = failureTag.subTags.map((subTag: FailureSubTagDb) => {
        return this.parseFailureSubTag(subTag);
      });
      return failureTag;
    });

    this.failureTagsSignal.set(failureTags);
  }

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

  getFailureTagById(id: string): FailureTag {
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
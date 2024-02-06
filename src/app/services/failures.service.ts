import { Injectable, WritableSignal, effect, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { collection, getDocs, query } from 'firebase/firestore';
import { FailureTag } from '../models/failure-tag.model';

export interface FailureTagDb {
  categoryID: string;
  description: string;
  descriptionEN: string;
  id: string;
  imageUrls: string[];
  name: string;
  nameEN: string;
  subTags: any;
}

@Injectable({
  providedIn: 'root'
})
export class FailuresService {
  public failureTags: WritableSignal<FailureTag[]> = signal([]);

  constructor(private db: Firestore) {
    this.getAllFailureTags();
  }

  public async getAllFailureTags() {
    const q = query(collection(this.db, 'tagsFailure'));
    const snapshot = await getDocs(q);
    let failureTags: any[] = [];
    snapshot.forEach(doc => {
      failureTags.push(this.parseFailureTag(doc.data() as FailureTagDb));
    });
    this.failureTags.set(failureTags);
  }

  private parseFailureTag(failureTag: FailureTagDb): FailureTag {
    let f = FailureTag.createEmpty();
    console.log(failureTag);
    f.categoryId = failureTag.categoryID;
    f.descriptionIt = failureTag.description;
    f.descriptionEn = failureTag.descriptionEN;
    f.id = failureTag.id;
    f.imageUrls = failureTag.imageUrls;
    f.nameIt = failureTag.name;
    f.nameEn = failureTag.nameEN;
    f.subTags = failureTag.subTags;

    return f;
  }
}
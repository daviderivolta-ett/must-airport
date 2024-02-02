import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { DocumentData, QuerySnapshot, collection, getDocs, query } from 'firebase/firestore';
import { Failure } from '../models/failure.model';
import { GeoPoint } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { Fields } from '../models/fields.model';

export interface FailureDb {
  childFlowId: string;
  childrenIds: string[];
  closed: boolean;
  closingChildId: string;
  closingTime: Timestamp;
  coverImgUrls: string[];
  creationTime: Timestamp;
  descriptionSelections: string[];
  fields: FieldsDb;
  language: string;
  lastChildTime: Timestamp;
  location: GeoPoint;
  parentFlowId: string;
  userId: string;
  verticalId: string
}

export interface FieldsDb {
  wideShots: string[],
  elementType: string[],
  tagTechElement: string[],
  subTagTechElement: string[]
}

@Injectable({
  providedIn: 'root'
})
export class FailuresService {

  constructor(private db: Firestore) { }

  public async getAllFailures(): Promise<QuerySnapshot<DocumentData>> {
    const q = query(collection(this.db, 'reportParents'));
    const snapshot = await getDocs(q);
    return snapshot;
  }

  public parseFailure(failure: FailureDb): Failure {
    let f = Failure.createEmpty();

    f.childFlowId = failure.childFlowId;
    f.childrenIds = failure.childrenIds;
    f.closed = failure.closed;
    f.closingChildId = failure.closingChildId;
    f.closingTime = failure.closingTime.toDate();
    f.coverImgUrls = failure.coverImgUrls;
    f.creationTime = failure.creationTime.toDate();
    f.descriptionSelections = failure.descriptionSelections;
    f.fields = this.parseFields(failure.fields as FieldsDb);
    f.language = failure.language;
    f.lastChildTime = failure.lastChildTime.toDate();
    f.location = failure.location;
    f.parentFlowId = failure.parentFlowId;
    f.userId = failure.userId;
    f.verticalId = failure.verticalId;

    return f;
  }

  private parseFields(fields: FieldsDb): Fields {
    let f = Fields.createEmpty();

    f.wideShots = fields.wideShots;
    f.elementType = fields.elementType;
    f.tagTechElement = fields.tagTechElement;
    f.subTagTechElement = fields.subTagTechElement;

    return f;
  }
}
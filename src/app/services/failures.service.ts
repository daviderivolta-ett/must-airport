import { Injectable, WritableSignal, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { DocumentData, QuerySnapshot, collection, getDocs, onSnapshot, query, doc } from 'firebase/firestore';
import { Failure } from '../models/failure.model';
import { GeoPoint } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { Fields } from '../models/fields.model';
import { BehaviorSubject } from 'rxjs';

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
  foto_campo_largo: string[],
  element_type: string[],
  tag_tech_el: string[],
  sub_tag_tech_el: string[]
}

@Injectable({
  providedIn: 'root'
})
export class FailuresService {
  private failures: BehaviorSubject<Failure[]> = new BehaviorSubject<Failure[]>([]);
  public failures$ = this.failures.asObservable();

  constructor(private db: Firestore) {
    this.getAllFailuresSnapshot();
  }

  public async getAllFailures(): Promise<QuerySnapshot<DocumentData>> {
    const q = query(collection(this.db, 'reportParents'));
    const snapshot = await getDocs(q);
    console.log(snapshot);

    return snapshot;
  }

  public getAllFailuresSnapshot(): void {
    const q = query(collection(this.db, 'reportParents'));
    const unsubscribe = onSnapshot(q,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const failures: any[] = [];
        querySnapshot.forEach(doc => {
          failures.push(this.parseFailure(doc.data() as FailureDb));
        });
        this.failures.next(failures);
      },
      (error: Error) => console.log(error)
    );
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

    if (fields.foto_campo_largo !== undefined) f.wideShots = fields.foto_campo_largo;
    if (fields.element_type !== undefined) f.elementType = fields.element_type;
    if (fields.tag_tech_el !== undefined) f.tagTechElement = fields.tag_tech_el;
    if (fields.sub_tag_tech_el !== undefined) f.subTagTechElement = fields.sub_tag_tech_el;

    return f;
  }
}
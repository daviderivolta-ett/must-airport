import { Injectable, WritableSignal, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { DocumentData, QuerySnapshot, collection, doc, getDoc, getDocs, onSnapshot, query } from 'firebase/firestore';
import { Failure } from '../models/failure.model';
import { GeoPoint } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { Fields } from '../models/fields.model';
import { Report } from '../models/report.model';

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

export interface ReportDb {
  closure: boolean;
  creationTime: Timestamp;
  description: string;
  flowId: string;
  foto_dettaglio: string[];
  language: string;
  parentId: string;
  userId: string;
  verticalId: string;
}

@Injectable({
  providedIn: 'root'
})
export class FailuresService {
  public failures: WritableSignal<Failure[]> = signal([]);

  constructor(private db: Firestore) {
    this.getAllFailuresSnapshot();
    this.populateChildrenReport('S2O6aBZH1U8BcpBvzSVz');
    this.populateChildrenReport('mcrko1HkRFJwj1wm1kxY');
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
          failures.push(this.parseFailure(doc.id, doc.data() as FailureDb));
        });
        this.failures.set(failures);
      },
      (error: Error) => console.log(error)
    );
  }

  public parseFailure(id: string, failure: FailureDb): Failure {
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
    f.id = id;

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

  public async populateChildrenReport(id: string): Promise<Report> {
    const q = doc(this.db, 'reportChildren', id);
    const snapshot = await getDoc(q);
    if (snapshot.exists()) {
      const r = snapshot.data() as ReportDb;
      const report: Report = this.parseReport(r);
      console.log(r);
      // console.log(report);      
      return report;
    } else {
      throw new Error('Report non trovato');
    }
  }

  private parseReport(report: ReportDb): Report {
    let r = Report.createEmpty();

    r.closure = report.closure;
    r.creationTime = report.creationTime.toDate();
    r.description = report.description;
    r.flowId = report.flowId;
    r.detailPics = report.foto_dettaglio;
    r.language = report.language;
    r.parentId = report.parentId;
    r.userId = report.userId;
    r.verticalId = report.verticalId;

    return r;
  }
}
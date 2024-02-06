import { Injectable, WritableSignal, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { DocumentData, QuerySnapshot, collection, doc, getDoc, getDocs, onSnapshot, query } from 'firebase/firestore';
import { ReportParent } from '../models/report-parent.model';
import { GeoPoint } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { ReportParentFields } from '../models/report-parent.fields.model';
import { ReportChild } from '../models/report-child.model';

export interface ReportParentDb {
  childFlowId: string;
  childrenIds: string[];
  closed: boolean;
  closingChildId: string;
  closingTime: Timestamp;
  coverImgUrls: string[];
  creationTime: Timestamp;
  descriptionSelections: string[];
  fields: ReportParentFieldsDb;
  language: string;
  lastChildTime: Timestamp;
  location: GeoPoint;
  parentFlowId: string;
  userId: string;
  verticalId: string
}

export interface ReportParentFieldsDb {
  foto_campo_largo: string[],
  element_type: string[],
  tag_tech_el: string[],
  sub_tag_tech_el: string[]
}

export interface ReportChildDb {
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
  public reports: WritableSignal<ReportParent[]> = signal([]);

  constructor(private db: Firestore) {
    this.getAllParentReportsSnapshot();
    // this.populateReportChildren('S2O6aBZH1U8BcpBvzSVz');
    this.populateChildReport('NXVcSiVL6McspPB9PoCm');
  }

  public async getAllFailures(): Promise<QuerySnapshot<DocumentData>> {
    const q = query(collection(this.db, 'reportParents'));
    const snapshot = await getDocs(q);
    console.log(snapshot);

    return snapshot;
  }

  public getAllParentReportsSnapshot(): void {
    const q = query(collection(this.db, 'reportParents'));
    const unsubscribe = onSnapshot(q,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const failures: any[] = [];
        querySnapshot.forEach(doc => {
          failures.push(this.parseParentReports(doc.id, doc.data() as ReportParentDb));
        });
        this.reports.set(failures);
      },
      (error: Error) => console.log(error)
    );
  }

  public parseParentReports(id: string, failure: ReportParentDb): ReportParent {
    let f = ReportParent.createEmpty();

    f.childFlowId = failure.childFlowId;
    f.childrenIds = failure.childrenIds;
    f.closed = failure.closed;
    f.closingChildId = failure.closingChildId;
    f.closingTime = failure.closingTime.toDate();
    f.coverImgUrls = failure.coverImgUrls;
    f.creationTime = failure.creationTime.toDate();
    f.descriptionSelections = failure.descriptionSelections;
    f.fields = this.parseParentReportsFields(failure.fields as ReportParentFieldsDb);
    f.language = failure.language;
    f.lastChildTime = failure.lastChildTime.toDate();
    f.location = failure.location;
    f.parentFlowId = failure.parentFlowId;
    f.userId = failure.userId;
    f.verticalId = failure.verticalId;
    f.id = id;

    return f;
  }

  private parseParentReportsFields(fields: ReportParentFieldsDb): ReportParentFields {
    let f = ReportParentFields.createEmpty();

    if (fields.foto_campo_largo !== undefined) f.wideShots = fields.foto_campo_largo;
    if (fields.element_type !== undefined) f.elementType = fields.element_type;
    if (fields.tag_tech_el !== undefined) f.tagTechElement = fields.tag_tech_el;
    if (fields.sub_tag_tech_el !== undefined) f.subTagTechElement = fields.sub_tag_tech_el;

    return f;
  }

  public async populateChildReport(id: string): Promise<ReportChild> {
    const q = doc(this.db, 'reportChildren', id);
    const snapshot = await getDoc(q);
    if (snapshot.exists()) {
      const r = snapshot.data() as ReportChildDb;
      const report: ReportChild = this.parseChildReport(r);
      console.log(r);
      // console.log(report);      
      return report;
    } else {
      throw new Error('Report non trovato');
    }
  }

  private parseChildReport(report: ReportChildDb): ReportChild {
    let r = ReportChild.createEmpty();

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
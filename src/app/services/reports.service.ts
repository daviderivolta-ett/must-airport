import { Injectable, WritableSignal, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { GeoPoint, Timestamp, DocumentData, QuerySnapshot, collection, doc, getDoc, getDocs, onSnapshot, query } from 'firebase/firestore';
import { ReportParent } from '../models/report-parent.model';
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
export class ReportsService {
  public reports: WritableSignal<ReportParent[]> = signal([]);

  constructor(private db: Firestore) {
    this.getAllParentReportsSnapshot();
    this.getChildReportById('S2O6aBZH1U8BcpBvzSVz');
    this.getChildReportById('NXVcSiVL6McspPB9PoCm');
  }

  public async getParentReports(): Promise<QuerySnapshot<DocumentData>> {
    const q = query(collection(this.db, 'reportParents'));
    const snapshot = await getDocs(q);
    return snapshot;
  }

  public getAllParentReportsSnapshot(): void {
    const q = query(collection(this.db, 'reportParents'));
    const unsubscribe = onSnapshot(q,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const reports: any[] = [];
        querySnapshot.forEach(doc => {
          reports.push(this.parseParentReport(doc.id, doc.data() as ReportParentDb));
        });
        this.reports.set(reports);
      },
      (error: Error) => console.log(error)
    );
  }

  public parseParentReport(id: string, report: ReportParentDb): ReportParent {
    let r = ReportParent.createEmpty();

    r.childFlowId = report.childFlowId;
    r.childrenIds = report.childrenIds;
    r.closed = report.closed;
    r.closingChildId = report.closingChildId;
    r.closingTime = report.closingTime.toDate();
    r.coverImgUrls = report.coverImgUrls;
    r.creationTime = report.creationTime.toDate();
    r.descriptionSelections = report.descriptionSelections;
    r.fields = this.parseParentReportsFields(report.fields as ReportParentFieldsDb);
    r.language = report.language;
    r.lastChildTime = report.lastChildTime.toDate();
    r.location = report.location;
    r.parentFlowId = report.parentFlowId;
    r.userId = report.userId;
    r.verticalId = report.verticalId;
    r.id = id;

    return r;
  }

  private parseParentReportsFields(fields: ReportParentFieldsDb): ReportParentFields {
    let f = ReportParentFields.createEmpty();

    if (fields.foto_campo_largo !== undefined) f.wideShots = fields.foto_campo_largo;
    if (fields.element_type !== undefined) f.elementType = fields.element_type;
    if (fields.tag_tech_el !== undefined) f.tagTechElement = fields.tag_tech_el;
    if (fields.sub_tag_tech_el !== undefined) f.subTagTechElement = fields.sub_tag_tech_el;

    return f;
  }

  public async getChildReportById(id: string): Promise<ReportChild> {
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
    r.flowId = report.flowId;
    r.detailPics = report.foto_dettaglio;
    r.language = report.language;
    r.parentId = report.parentId;
    r.userId = report.userId;
    r.verticalId = report.verticalId;

    return r;
  }
}
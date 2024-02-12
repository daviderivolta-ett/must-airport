import { Injectable, WritableSignal, effect, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { GeoPoint, Timestamp, DocumentData, QuerySnapshot, collection, doc, getDoc, getDocs, onSnapshot, query, orderBy } from 'firebase/firestore';
import { ReportParent } from '../models/report-parent.model';
import { ReportParentFields } from '../models/report-parent.fields.model';
import { ReportChild } from '../models/report-child.model';
import { DictionaryService } from './dictionary.service';
import { TechElementTag } from '../models/tech-element-tag.model';
import { TechElementSubTag } from '../models/tech-element-subtag.model';
import { FailureTag } from '../models/failure-tag.model';
import { FailureSubTag } from '../models/failure-subtag.model';

export interface ReportParentDb {
  childFlowId: string;
  childrenIds: string[];
  closed: boolean;
  closingChildId: string;
  closingTime: Timestamp;
  coverImgUrls: string[];
  creationTime: Timestamp;
  descriptionSelections: string[];
  descriptionText: string,
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
  comment: string;
  creationTime: Timestamp;
  flowId: string;
  foto_dettaglio: string[];
  language: string;
  parentId: string;
  sub_tag_failure: string[];
  tag_failure: string[];
  userId: string;
  verticalId: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  public selectedReport: WritableSignal<ReportParent> = signal(ReportParent.createEmpty());
  public selectedReportId: string = '';
  public reports: WritableSignal<ReportParent[]> = signal([]);

  constructor(private db: Firestore, private dictionaryService: DictionaryService) { }

  public async getAllParentReports() {
    await this.dictionaryService.getAll();
    // console.log(this.dictionaryService.failureTags);
    // console.log(this.dictionaryService.techElementTags);

    const q = query(collection(this.db, 'reportParents'), orderBy('lastChildTime', 'desc'));
    const unsubscribe = onSnapshot(q,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        let reports: any[] = [];
        querySnapshot.forEach(doc => {
          reports.push(this.parseParentReport(doc.id, doc.data() as ReportParentDb));
        });

        reports = reports.map((report: ReportParent) => {
          report = this.populateTechElementTags(report);
          report = this.populateTechElementSubTags(report);
          return report;
        });

        this.reports.set(reports);

        if (this.selectedReportId) {
          const selectedReport = reports.find(report => report.id === this.selectedReportId);
          if (selectedReport) this.selectedReport.set(selectedReport);
        }
      },
      (error: Error) => console.log(error)
    );
  }

  public selectReport(id: string) {
    this.selectedReportId = id;
    if(this.reports().length > 0) {
      const selectedReport = this.reports().find(report => report.id === this.selectedReportId);
      if (selectedReport) this.selectedReport.set(selectedReport);      
    }
  }

  // public getParentReportById(id: string | null) {
  //   let reports = this.reports();
  //   let report = ReportParent.createEmpty();
  //   reports.forEach((r: ReportParent) => {    
  //     if (r.id === id) report = r;
  //   });
  //   console.log(reports);
  //   return report;
  // }

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
    r.descriptionText = report.descriptionText;
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

  public async populateChildrenReports(ids: string[]): Promise<ReportChild[]> {
    let reports: ReportChild[] = await Promise.all(ids.map(async id => {
      return await this.getChildReportById(id);
    }));
    return reports.reverse();
  }

  public populateTechElementTags(report: ReportParent): ReportParent {
    let tagIds: string[] = report.fields.tagTechElement as string[];
    let techElementTags: TechElementTag[] = tagIds.map((id: string) => {
      return this.dictionaryService.getTechElementTagById(id);
    });
    report.fields.tagTechElement = techElementTags;
    return report;
  }

  public populateTechElementSubTags(report: ReportParent): ReportParent {
    let subTagIds: string[] = report.fields.subTagTechElement as string[];
    let techElementSubTags: TechElementSubTag[] = subTagIds.map((id: string) => {
      return this.dictionaryService.getTechElementSubTagById(id);
    });
    report.descriptionSelections = techElementSubTags;
    report.fields.subTagTechElement = techElementSubTags;
    return report;
  }

  public async getChildReportById(id: string): Promise<ReportChild> {
    const q = doc(this.db, 'reportChildren', id);
    const snapshot = await getDoc(q);
    if (snapshot.exists()) {
      const r = snapshot.data() as ReportChildDb;
      const report: ReportChild = this.parseChildReport(r);
      return report;
    } else {
      throw new Error('Report non trovato');
    }
  }

  private parseChildReport(report: ReportChildDb): ReportChild {
    let r = ReportChild.createEmpty();

    r.closure = report.closure;
    r.comment = report.comment || '-';
    r.creationTime = report.creationTime.toDate();
    r.flowId = report.flowId;
    r.detailPics = report.foto_dettaglio;
    r.language = report.language;
    r.parentId = report.parentId;
    r.subTagFailure = report.sub_tag_failure;
    r.tagFailure = report.tag_failure;
    r.userId = report.userId;
    r.verticalId = report.verticalId;

    return r;
  }

  public populateFailureTags(report: ReportChild): ReportChild {
    let tagIds: string[] = report.tagFailure as string[];
    let failureTags: FailureTag[] = tagIds.map((id: string) => {
      return this.dictionaryService.getFailureTagById(id);
    });
    report.tagFailure = failureTags;
    return report;
  }

  public populateFailureSubtags(report: ReportChild): ReportChild {
    let subTagIds: string[] = report.subTagFailure as string[];
    let failureSubTags: FailureSubTag[] = subTagIds.map((id: string) => {
      return this.dictionaryService.getFailureSubTagById(id);
    });
    report.subTagFailure = failureSubTags;
    return report;
  }
}
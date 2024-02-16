import { Injectable, WritableSignal, effect, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { GeoPoint, Timestamp, DocumentData, QuerySnapshot, collection, doc, getDoc, getDocs, onSnapshot, query, orderBy, setDoc } from 'firebase/firestore';
import { ReportParent } from '../models/report-parent.model';
import { ReportParentFields } from '../models/report-parent.fields.model';
import { ReportChild } from '../models/report-child.model';
import { DictionaryService } from './dictionary.service';
import { TechElementTag } from '../models/tech-element-tag.model';
import { TechElementSubTag } from '../models/tech-element-subtag.model';
import { FailureTag } from '../models/failure-tag.model';
import { FailureSubTag } from '../models/failure-subtag.model';
import { PRIORITY, Priority } from '../models/priority.model';
import { Language } from '../models/language.mode';

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
  priority?: string;
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

export interface ValidationFormData {
  priorityForm: { [key: string]: string };
  techElementTagsForm: { [key: string]: boolean };
  techElementSubTagsForm: { [key: string]: boolean }
}

export interface FiltersFormData {
  // priority: string;
  [key: string]: boolean;
  notAssigned: boolean,
  low: boolean,
  medium: boolean,
  high: boolean
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  public reportsSignal: WritableSignal<ReportParent[]> = signal([]);
  public reports: ReportParent[] = [];
  public filteredReportsSignal: WritableSignal<ReportParent[]> = signal([]);
  public filteredReports: ReportParent[] = [];
  public selectedReportSignal: WritableSignal<ReportParent> = signal(ReportParent.createEmpty());
  public selectedReportId: string = '';

  constructor(private db: Firestore, private dictionaryService: DictionaryService) {
    effect(() => this.reports = this.reportsSignal());
    effect(() => this.filteredReports = this.filteredReportsSignal());
  }

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

        this.reportsSignal.set(reports);

        if (this.selectedReportId) {
          const selectedReport = reports.find(report => report.id === this.selectedReportId);
          if (selectedReport) this.selectedReportSignal.set(selectedReport);
        }
      },
      (error: Error) => console.log(error)
    );
  }

  public async setReportById(id: string, data: any): Promise<void> {
    const ref = doc(this.db, 'reportParents', id);
    await setDoc(ref, data, { merge: true });
  }

  public selectReport(id: string) {
    this.selectedReportId = id;
    if (this.reports.length > 0) {
      const selectedReport = this.reports.find(report => report.id === this.selectedReportId);
      if (selectedReport) this.selectedReportSignal.set(selectedReport);
    }
  }

  public filterReports(filters: FiltersFormData) {
    let filteredReports: ReportParent[] = [];
    for (const key in filters) {
      if (filters[key] === false) continue;
      if (key === 'notAssigned' && filters[key] === true) {        
        filteredReports = filteredReports.concat(this.reports.filter(report => report.priority === undefined || report.priority === PRIORITY.NotAssigned));
      } else if (filters[key] === true) {
        filteredReports = filteredReports.concat(this.reports.filter(report => report.priority === key));
      }
    }
    this.filteredReportsSignal.set(filteredReports);
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
    r.language = Language.parseLanguage(report.language);
    r.lastChildTime = report.lastChildTime.toDate();
    r.location = report.location;
    r.parentFlowId = report.parentFlowId;
    r.priority = Priority.parsePriorities(report.priority);
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
    r.subTagFailure = report.sub_tag_failure || [];
    r.tagFailure = report.tag_failure || [];
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

  public parseValidationFormData(formData: ValidationFormData): any {
    let parentReport: any = {
      priority: '',
      fields: {
        tag_tech_el: [],
        sub_tag_tech_el: []
      }
    };
    for (const key in formData.techElementTagsForm) {
      if (formData.techElementTagsForm[key] === true) parentReport.fields.tag_tech_el.push(key);
    }

    for (const key in formData.techElementSubTagsForm) {
      if (formData.techElementSubTagsForm[key] === true) parentReport.fields.sub_tag_tech_el.push(key);
    }

    parentReport.priority = formData.priorityForm['priority'];
    return parentReport;
  }

}
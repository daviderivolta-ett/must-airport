import { Injectable, WritableSignal, effect, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { GeoPoint, Timestamp, DocumentData, QuerySnapshot, collection, doc, getDoc, getDocs, onSnapshot, query, orderBy, setDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove, where, or, Query } from 'firebase/firestore';
import { ReportParent } from '../models/report-parent.model';
import { ReportParentFields } from '../models/report-parent.fields.model';
import { ReportChild } from '../models/report-child.model';
import { DictionaryService } from './dictionary.service';
import { TechElementTag } from '../models/tech-element-tag.model';
import { TechElementSubTag } from '../models/tech-element-subtag.model';
import { FailureTag } from '../models/failure-tag.model';
import { FailureSubTag } from '../models/failure-subtag.model';
import { PRIORITY, Priority } from '../models/priority.model';
import { Language } from '../models/language.model';
import { StorageReference, deleteObject, getMetadata, ref } from 'firebase/storage';
import { Storage } from '@angular/fire/storage';
import { OPERATIONTYPE, Operation, OperationDb } from '../models/operation.model';
import { APPFLOW } from '../models/app-flow.model';
import { USERLEVEL } from '../models/user.model';

export interface ReportParentDb {
  childFlowId: string;
  childrenIds: string[];
  closed: boolean;
  closingChildId: string;
  closingTime: Timestamp | null;
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
  verticalId: string,
  operations: OperationDb[],
  validationDate: Timestamp
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
  [key: string]: any;
  notAssigned: boolean;
  low: boolean;
  medium: boolean;
  high: boolean;
  initialDate: Date | null;
  endingDate: Date | null;
}

export interface ParsedFiltersFormData {
  priority: {
    [key: string]: any;
    notAssigned: boolean;
    low: boolean;
    medium: boolean;
    high: boolean;
  },
  date: {
    [key: string]: any;
    initialDate: Date | null;
    endingDate: Date | null;
  }
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

  constructor(private db: Firestore, private storage: Storage, private dictionaryService: DictionaryService) {
    effect(() => this.reports = this.reportsSignal());
    effect(() => this.filteredReports = this.filteredReportsSignal());
  }

  public async getAllParentReports(appFlow: APPFLOW, validated: boolean) {
    await this.dictionaryService.getAll();
    // console.log(this.dictionaryService.failureTagsSignal());
    // console.log(this.dictionaryService.techElementTags);

    let q: Query;
    if (validated) {
      q = query(collection(this.db, 'reportParents'), where('verticalId', '==', appFlow));
    } else {
      q = query(collection(this.db, 'reportParents'), where('verticalId', '==', appFlow), where('priority', '!=', null));
    }

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

        reports = reports.sort((a, b) => b.lastChildTime.getTime() - a.lastChildTime.getTime());
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

  public filterReports(filters: ParsedFiltersFormData): void {
    let filteredReports: ReportParent[] = [];
    let priorityData = filters.priority;
    for (const key in priorityData) {
      if (priorityData[key] === false) continue;
      if (key === 'notAssigned' && priorityData[key] === true) {
        filteredReports = filteredReports.concat(this.reports.filter(report => report.priority === undefined || report.priority === PRIORITY.NotAssigned));
      } else if (priorityData[key] === true) {
        filteredReports = filteredReports.concat(this.reports.filter(report => report.priority === key));
      }
    }
    let dateData = filters.date;
    for (const key in dateData) {
      if (dateData[key] === null) continue;
      if (key === 'initialDate' && dateData[key] !== null) {
        filteredReports = filteredReports.filter(report => report.creationTime > dateData[key]!)
      }
      if (key === 'endingDate' && dateData[key] !== null) {
        filteredReports = filteredReports.filter(report => report.creationTime < dateData[key]!)
      }
    }
    this.filteredReportsSignal.set(filteredReports);
  }

  public getImageReference(url: string): StorageReference {
    return ref(this.storage, url);
  }

  public deleteImage(imgRef: StorageReference): void {
    getMetadata(imgRef)
      .then(() => {
        deleteObject(imgRef)
          .then(() => {
            console.log('Immagine cancellata correttamente.');
          })
          .catch(error => {
            console.log('Errore nella cancellazione dell\'immagine!');
            console.log(error);
          });
      })
      .catch(error => {
        console.log('L\'oggetto non esiste.');
      });
  }

  public async getParentReportById(id: string): Promise<ReportParentDb> {
    const q = doc(this.db, 'reportParents', id);
    const snapshot = await getDoc(q);
    if (snapshot.exists()) {
      return snapshot.data() as ReportParentDb;
    } else {
      throw new Error('Report non trovato.');
    }
  }

  public async setOperationsByReportId(id: string, operation: OperationDb): Promise<void> {
    let parentReport: ReportParentDb = await this.getParentReportById(id);
    if (!parentReport.operations) parentReport.operations = [];

    const ref = doc(this.db, 'reportParents', id);
    await updateDoc(ref, {
      operations: arrayUnion(operation)
    })
  }

  public async deleteOperationByReportId(id: string, operation: Operation): Promise<void> {
    let parentReport: ReportParentDb = await this.getParentReportById(id);
    let operationDb: any = this.reParseParentReportOperation(operation);
    console.log(operationDb);
    const ref = doc(this.db, 'reportParents', id);
    await updateDoc(ref, {
      operations: arrayRemove(operationDb)
    })
    console.log(parentReport);
  }

  public parseParentReport(id: string, report: ReportParentDb): ReportParent {
    let r = ReportParent.createEmpty();

    r.childFlowId = report.childFlowId;
    r.childrenIds = report.childrenIds;
    r.closed = report.closed;
    r.closingChildId = report.closingChildId;
    report.closingTime ? r.closingTime = report.closingTime.toDate() : r.closingTime = null;
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

    if (report.operations) {
      r.operations = report.operations.map((operation: OperationDb) => {
        return this.parseParentReportOperation(operation);
      });
    } else {
      r.operations = [];
    }

    if (report.validationDate) r.validationDate = report.validationDate.toDate();

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

  private parseParentReportOperation(operation: OperationDb): Operation {
    let o = Operation.createEmpty();

    if (operation.date !== undefined) o.date = operation.date.toDate();
    if (operation.operatorName !== undefined) o.operatorName = operation.operatorName;
    if (operation.type !== undefined) {
      switch (operation.type) {
        case 'intervention':
          o.type = OPERATIONTYPE.Intervention;
          break;
        case 'inspection':
          o.type = OPERATIONTYPE.Inspection;
          break;
        default:
          o.type = OPERATIONTYPE.Inspection;
          break;
      }
    }
    if (operation.id !== undefined) o.id = operation.id;

    return o;
  }

  private reParseParentReportOperation(operation: Operation): any {
    let o = {
      date: Timestamp.fromDate(operation.date),
      operatorName: operation.operatorName,
      type: operation.type,
      id: operation.id
    }

    return o;
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
      const report: ReportChild = this.parseChildReport(id, r);
      return report;
    } else {
      throw new Error('Report non trovato');
    }
  }

  public async deleteChildReportBydId(id: string): Promise<void> {
    try {
      let childReport: ReportChild = await this.getChildReportById(id);
      childReport.detailPics.forEach(url => {
        let imgRef = this.getImageReference(url);
        this.deleteImage(imgRef);
      });

      let parentReport = await this.getParentReportById(childReport.parentId);
      parentReport.childrenIds = parentReport.childrenIds.filter(id => id !== childReport.id);
      this.setReportById(childReport.parentId, parentReport);
      await deleteDoc(doc(this.db, 'reportChildren', id))
    } catch (error) {
      console.error(error);
    }
  }

  private parseChildReport(id: string, report: ReportChildDb): ReportChild {
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
    r.id = id;

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
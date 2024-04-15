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
import { LANGUAGE, Language } from '../models/language.model';
import { StorageReference, deleteObject, getMetadata, ref } from 'firebase/storage';
import { Storage } from '@angular/fire/storage';
import { OPERATIONTYPE, Operation, OperationDb } from '../models/operation.model';
import { VERTICAL } from '../models/app-flow.model';
import { ReportChildFields } from '../models/report-child.fields.model';
import { ConfigService } from './config.service';
import { Tag } from '../models/tag.model';

export interface ReportParentDb {
  childFlowsIds: string[];
  childrenIds: string[];
  closed: boolean;
  closingChildId: string | null;
  closingTime: Timestamp | null;
  coverImgUrls: string[];
  creationTime: Timestamp;
  descriptionSelections: string[];
  descriptionText: string;
  fields: ReportParentFieldsDb;
  language: string;
  lastChildTime: Timestamp;
  location: GeoPoint;
  parentFlowId: string;
  priority?: string;
  userId: string;
  validated: boolean;
  validationDate: Timestamp;
  verticalId: string;
  operations: OperationDb[];
  archived?: boolean;
  archivingTime?: Timestamp | null;
}

export interface ReportParentFieldsDb {
  foto_campo_largo: string[],
  element_type: string[],
  tag_tech_el: string[],
  sub_tag_tech_el: string[]
}

export interface ReportParentClosingDataDb {
  archived: boolean,
  archivingTime: Timestamp | null
}

export interface ReportChildDb {
  closure: boolean;
  creationTime: Timestamp;
  fields: ReportChildFieldsDb;
  flowId: string;
  language: string;
  parentId: string;
  userId: string;
  verticalId: string;
}

export interface ReportChildFieldsDb {
  comment: string,
  foto_dettaglio: string[],
  sub_tag_failure: string[];
  tag_failure: string[];
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
  public archivedReports: ReportParent[] = [];
  public archivedReportsSignal: WritableSignal<ReportParent[]> = signal([]);
  public closedReports: ReportParent[] = [];
  public closedReportSignal: WritableSignal<ReportParent[]> = signal([]);

  constructor(private db: Firestore, private storage: Storage, private dictionaryService: DictionaryService, private configService: ConfigService) {
    effect(() => this.reports = this.reportsSignal());
    effect(() => this.filteredReports = this.filteredReportsSignal());
    effect(() => this.archivedReports = this.archivedReportsSignal());
  }

  public async getAllParentReports(verticalId: VERTICAL, getAll: boolean) {
    // console.log('VERTICAL:', verticalId);
    await this.dictionaryService.getAll();
    await this.configService.getVerticalConfig(verticalId);
    // console.log(this.dictionaryService.failureTagsSignal());
    // console.log(this.dictionaryService.techElementTags);

    let q: Query;
    if (getAll) {
      q = query(collection(this.db, 'reportParents'), where('verticalId', '==', verticalId));
    } else {
      q = query(collection(this.db, 'reportParents'), where('verticalId', '==', verticalId), where('validated', '==', true));
    }

    const unsubscribe = onSnapshot(q,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        let reports: ReportParent[] = [];
        querySnapshot.forEach(doc => {
          reports.push(this.parseParentReport(doc.id, doc.data() as ReportParentDb));
        });

        reports = reports.map((report: ReportParent) => {
          report = this.populateParentFlowTags1(report);
          report = this.populateParentFlowTags2(report);
          report = this.populateTechElementTags(report);
          report = this.populateTechElementSubTags(report);
          return report;
        });

        reports = reports.sort((a, b) => b.lastChildTime.getTime() - a.lastChildTime.getTime());
        let allReports: ReportParent[] = reports.filter(report => (report.isArchived === false || report.isArchived === undefined) && report.closingChildId === null);
        this.reportsSignal.set(allReports);

        let archivedReports: ReportParent[] = reports.filter(report => report.isArchived === true);
        this.archivedReportsSignal.set(archivedReports);

        let closedReports: ReportParent[] = reports.filter(report => report.closingChildId);
        this.closedReportSignal.set(closedReports);

        if (this.selectedReportId) {
          const selectedReport = allReports.find(report => report.id === this.selectedReportId);
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

  public selectReport(id: string): void {
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
    // console.log(operationDb);
    // console.log(parentReport);
    const ref = doc(this.db, 'reportParents', id);
    await updateDoc(ref, {
      operations: arrayRemove(operationDb)
    })
  }

  public parseParentReport(id: string, report: ReportParentDb): ReportParent {
    let r = ReportParent.createEmpty();

    r.childFlowIds = report.childFlowsIds;
    r.childrenIds = report.childrenIds;
    report.closed ? r.isClosed = report.closed : r.isClosed = false;
    report.closingChildId ? r.closingChildId = report.closingChildId : r.closingChildId = null;
    report.closingTime ? r.closingTime = report.closingTime.toDate() : r.closingTime = null;
    r.coverImgUrls = report.coverImgUrls;
    r.creationTime = report.creationTime.toDate();
    r.descriptionSelections = report.descriptionSelections;
    r.descriptionText = report.descriptionText;
    r.fields = this.parseParentReportFields(report.fields as ReportParentFieldsDb);
    r.language = Language.parseLanguage(report.language);
    r.lastChildTime = report.lastChildTime.toDate();
    r.location = report.location;
    r.parentFlowId = report.parentFlowId;
    r.priority = Priority.parsePriorities(report.priority);
    r.userId = report.userId;
    r.isValidated = report.validated;
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
    if (report.archived) r.isArchived = report.archived;
    if (report.archivingTime) r.archivingTime = report.archivingTime.toDate();

    return r;
  }

  private parseParentReportFields(fields: ReportParentFieldsDb): ReportParentFields {
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
        case 'maintenance':
          o.type = OPERATIONTYPE.Maintenance;
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
    if (operation.operationLink !== undefined) o.operationLink = operation.operationLink;

    return o;
  }

  private reParseParentReportOperation(operation: Operation): any {
    let o = {
      date: Timestamp.fromDate(operation.date),
      operatorName: operation.operatorName,
      type: operation.type,
      id: operation.id,
      operationLink: operation.operationLink
    }

    return o;
  }

  public async getAllChildrenReports(verticalId: VERTICAL): Promise<ReportChild[]> {
    let q: Query = query(collection(this.db, 'reportChildren'), where('verticalId', '==', verticalId));

    try {
      const querySnapshot: QuerySnapshot = await getDocs(q);
      const childrenReport: ReportChild[] = querySnapshot.docs.map(doc => {
        let childReport: ReportChild = this.parseChildReport(doc.id, doc.data() as ReportChildDb);
        childReport = this.populateChildFlowTags1(childReport);
        childReport = this.populateChildFlowTags2(childReport);
        childReport = this.populateFailureTags(childReport);
        childReport = this.populateFailureSubtags(childReport);
        return childReport;
      });
      return childrenReport;
    } catch (error) {
      console.error('Errore durante il recupero dei dati:', error);
      throw error;
    }
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
    report.descriptionSelections = techElementTags;
    return report;
  }

  public populateTechElementSubTags(report: ReportParent): ReportParent {
    let subTagIds: string[] = report.fields.subTagTechElement as string[];
    let techElementSubTags: TechElementSubTag[] = subTagIds.map((id: string) => {
      return this.dictionaryService.getTechElementSubTagById(id);
    });
    report.fields.subTagTechElement = techElementSubTags;
    return report;
  }

  public populateParentFlowTags1(report: ReportParent): ReportParent {
    let tagIds: string[] = report.fields.tagTechElement as string[];
    let parentFlowTags: Tag[] = tagIds.map((id: string) => {
      let tag: Tag | undefined = this.configService.parentFlowTags.find((tag: Tag) => tag.id === id);
      return tag ? tag : Tag.createEmpty();
    });
    report.fields.parentFlowTags1 = parentFlowTags;
    return report;
  }

  public populateParentFlowTags2(report: ReportParent): ReportParent {
    let subTagIds: string[] = report.fields.subTagTechElement as string[];
    let parentFlowTags: Tag[] = subTagIds.map((id: string) => {
      let foundTag: Tag | undefined;
      this.configService.parentFlowTags.forEach((tag: Tag) => {
        let foundOption: Tag | undefined = tag.options.find((subTag: Tag) => subTag.id === id);
        if (foundOption) {
          foundTag = foundOption;
          return;
        }
      });
      return foundTag ? foundTag : Tag.createEmpty();
    });
    report.fields.parentFlowTags2 = parentFlowTags;
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
      childReport.fields.detailShots.forEach(url => {
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

    r.isClosed = report.closure;
    r.creationTime = report.creationTime.toDate();
    r.fields = this.parseChildReportFields(report.fields);
    r.flowId = report.flowId;

    switch (report.language) {
      case 'en':
        r.language = LANGUAGE.English
        break;
      default:
        r.language = LANGUAGE.Italian
        break;
    }

    r.parentId = report.parentId;
    r.userId = report.userId;
    r.verticalId = report.verticalId;
    r.id = id;

    return r;
  }

  private parseChildReportFields(fields: ReportChildFieldsDb): ReportChildFields {
    let f = ReportChildFields.createEmpty();

    if (fields.foto_dettaglio) f.detailShots = fields.foto_dettaglio;
    fields.comment && fields.comment.length !== 0 ? f.description = fields.comment : f.description = '-';
    fields.tag_failure ? f.tagFailure = fields.tag_failure : []
    fields.sub_tag_failure ? f.subTagFailure = fields.sub_tag_failure : []

    return f;
  }

  public populateFailureTags(report: ReportChild): ReportChild {
    let tagIds: string[] = report.fields.tagFailure as string[];
    let failureTags: FailureTag[] = tagIds.map((id: string) => {
      return this.dictionaryService.getFailureTagById(id);
    });
    report.fields.tagFailure = failureTags;
    return report;
  }

  public populateFailureSubtags(report: ReportChild): ReportChild {
    let subTagIds: string[] = report.fields.subTagFailure as string[];
    let failureSubTags: FailureSubTag[] = subTagIds.map((id: string) => {
      return this.dictionaryService.getFailureSubTagById(id);
    });
    report.fields.subTagFailure = failureSubTags;
    return report;
  }

  public populateChildFlowTags1(report: ReportChild): ReportChild {
    let tagIds: string[] = report.fields.tagFailure as string[];
    let childFlowTags: Tag[] = tagIds.map((id: string) => {
      let tag: Tag | undefined = this.configService.childFlowTags.find((tag: Tag) => tag.id === id);
      return tag ? tag : Tag.createEmpty();
    });
    report.fields.childFlowTags1 = childFlowTags;
    return report;
  }

  public populateChildFlowTags2(report: ReportChild): ReportChild {
    let subTagIds: string[] = report.fields.subTagFailure as string[];
    let childFlowTags: Tag[] = subTagIds.map((id: string) => {
      let foundTag: Tag | undefined;
      this.configService.childFlowTags.forEach((tag: Tag) => {
        let foundOption: Tag | undefined = tag.options.find((subTag: Tag) => subTag.id === id);
        if (foundOption) {
          foundTag = foundOption;
          return;
        }
      });
      return foundTag ? foundTag : Tag.createEmpty();
    });
    report.fields.childFlowTags2 = childFlowTags;
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

  public getAllOperations(): Operation[] {
    const operations: Operation[] = []
    this.reports.map((report: ReportParent) => {
      report.operations.forEach((operation: Operation) => {
        operations.push(operation);
      });
    })
    return operations;
  }
}
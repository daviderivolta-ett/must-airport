import { Injectable, WritableSignal, effect, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { GeoPoint, Timestamp, DocumentData, QuerySnapshot, collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove, where, or, Query, addDoc, DocumentReference } from 'firebase/firestore';
import { ReportParent } from '../models/report-parent.model';
import { ReportChild } from '../models/report-child.model';
import { DictionaryService } from './dictionary.service';
import { PRIORITY, Priority } from '../models/priority.model';
import { LANGUAGE, Language } from '../models/language.model';
import { StorageReference, deleteObject, getMetadata, ref } from 'firebase/storage';
import { Storage } from '@angular/fire/storage';
import { OPERATIONTYPE, Operation, OperationDb } from '../models/operation.model';
import { VERTICAL } from '../models/vertical.model';
import { ConfigService } from './config.service';
import { ReportTag, ReportTagGroup, Tag, TagGroup } from '../models/tag.model';

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
  files?: string[];
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
  comment: string;
  foto_dettaglio: string[];
  sub_tag_failure: string[];
  tag_failure: string[];
  intervention_photo: string[];
}

export interface ValidationFormData {
  priorityForm: { [key: string]: string };
  techElementTagsForm: { [key: string]: boolean };
  techElementSubTagsForm: { [key: string]: boolean }
}

export interface FiltersFormData {
  [key: string]: any;
  closed: boolean;
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

export interface ChildReportFiltersFormData {
  maintenance: boolean,
  inspection: boolean,
  other: boolean
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
  public archivedReportsSignal: WritableSignal<ReportParent[]> = signal([]);
  public archivedReports: ReportParent[] = [];
  public closedReportSignal: WritableSignal<ReportParent[]> = signal([]);
  public closedReports: ReportParent[] = [];

  constructor(private db: Firestore, private storage: Storage, private dictionaryService: DictionaryService, private configService: ConfigService) {
    effect(() => this.reports = this.reportsSignal());
    effect(() => this.filteredReports = this.filteredReportsSignal());
    effect(() => this.archivedReports = this.archivedReportsSignal());
  }

  public async getAllParentReports(verticalId: VERTICAL, getAll: boolean) {
    let q: Query;

    if (verticalId === VERTICAL.Default) {
      if (getAll) {
        q = query(collection(this.db, 'reportParents'));
      } else {
        q = query(collection(this.db, 'reportParents'), where('validated', '==', true));
      }
    } else {
      if (getAll) {
        q = query(collection(this.db, 'reportParents'), where('verticalId', '==', verticalId));
      } else {
        q = query(collection(this.db, 'reportParents'), where('verticalId', '==', verticalId), where('validated', '==', true));
      }
    }

    // if (getAll) {
    //   q = query(collection(this.db, 'reportParents'), where('verticalId', '==', verticalId));
    // } else {
    //   q = query(collection(this.db, 'reportParents'), where('verticalId', '==', verticalId), where('validated', '==', true));
    // }

    const unsubscribe = onSnapshot(q,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        let reports: ReportParent[] = [];
        querySnapshot.forEach(doc => {
          reports.push(this.parseParentReport(doc.id, doc.data() as ReportParentDb));
        });

        reports = reports.sort((a, b) => b.lastChildTime.getTime() - a.lastChildTime.getTime());
        // let allReports: ReportParent[] = reports.filter(report => (report.isArchived === false || report.isArchived === undefined) && report.closingChildId === null);
        let allReports: ReportParent[] = reports.filter(report => (report.isArchived === false || report.isArchived === undefined));

        let closedReports: ReportParent[] = reports.filter(report => report.closingChildId);
        this.closedReportSignal.set(closedReports);

        this.reportsSignal.set(allReports);

        let archivedReports: ReportParent[] = reports.filter(report => report.isArchived === true);
        this.archivedReportsSignal.set(archivedReports);


        if (this.selectedReportId) {
          const selectedReport = allReports.find(report => report.id === this.selectedReportId);
          if (selectedReport) this.selectedReportSignal.set(selectedReport);
        }
      },
      (error: Error) => console.log(error)
    );
  }

  public async setReportById(id: string, data: any): Promise<void> {
    try {
      const ref = doc(this.db, 'reportParents', id);
      await setDoc(ref, data, { merge: true });
    } catch (error) {
      console.error('Error setting document: ', error);
      throw new Error('Failed to set report by ID');
    }
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
      } else if (key !== 'closed' && priorityData[key] === true) {
        filteredReports = filteredReports.concat(this.reports.filter(report => report.priority === key && !report.closingChildId));
      } else if (key === 'closed' && priorityData[key] === true) {
        filteredReports = filteredReports.concat(this.reports.filter(report => report.closingChildId));
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
    const ref = doc(this.db, 'reportParents', id);
    await updateDoc(ref, {
      operations: arrayRemove(operationDb)
    })
  }

  public async setReportFilesByReportId(id: string, fileName: string): Promise<void> {
    const ref: DocumentReference = doc(this.db, 'reportParents', id);
    await updateDoc(ref, {
      files: arrayUnion(fileName)
    });
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
    r.fields = this.parseReportFields(report.fields);
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
    report.files ? r.files = report.files : r.files = [];

    r.tags = { parent: this.parseReportTags(r.fields, 'parent').sort((a, b) => a.order - b.order), child: this.parseReportTags(r.fields, 'child').sort((a, b) => a.order - b.order) };

    return r;
  }

  public parseReportTags(fields: any, type: 'parent' | 'child'): ReportTagGroup[] {
    const tagGroups: ReportTagGroup[] = this.getTagGroups(fields, type);

    this.populateTagGroups(tagGroups, fields, type);

    return tagGroups;
  }

  private getTagGroups(fields: any, type: 'parent' | 'child'): ReportTagGroup[] {
    let order: number = 0;
    const tagGroups: ReportTagGroup[] = [];
    for (const fieldKey in fields) {
      for (const group of this.configService.config.tags[type].groups) {
        const tagGroup = this.searchTagGroup(group, fieldKey, order);
        if (tagGroup) tagGroups.push(tagGroup);
      }
    }
    return tagGroups;
  }

  private populateTagGroups(tagGroups: ReportTagGroup[], fields: any, type: 'parent' | 'child'): void {
    for (const key in fields) {
      tagGroups.forEach((tagGroup: ReportTagGroup) => {
        if (tagGroup.id === key) {
          fields[key].forEach((id: string) => {
            this.configService.config.tags[type].elements.forEach((t: Tag) => {
              const tag = this.searchTags(t, id);
              if (tag) tagGroup.elements.push(tag);
            });
          });
        }
      });
    }
  }

  private searchTagGroup(group: TagGroup, fieldKey: string, order: number): ReportTagGroup | null {
    if (group.id === fieldKey) {
      return new ReportTagGroup(group.id, group.name, [], order);
    }
    if (group.subGroup) {
      order++;
      const subGroup = this.searchTagGroup(group.subGroup, fieldKey, order);
      if (subGroup) {
        return subGroup;
      }
    }
    return null;
  }

  private searchTags(tag: Tag, id: string): ReportTag | null {
    if (tag.id === id) {
      return new ReportTag(tag.id, tag.name, tag.description);
    }

    if (tag.subTags) {
      for (const subTag of tag.subTags) {
        const foundTag = this.searchTags(subTag, id);
        if (foundTag) return foundTag;
      }
    }

    return null;
  }

  public mergeReportTagGroups(tagGroups: ReportTagGroup[]): ReportTagGroup[] {
    const groupMap = new Map<string, ReportTagGroup>();

    tagGroups.forEach((group: ReportTagGroup) => {
      if (groupMap.has(group.id)) {
        const existingGroup = groupMap.get(group.id) as ReportTagGroup;
        if (existingGroup) {
          const mergedElements: ReportTag[] = [...existingGroup.elements, ...group.elements];
          const uniqueElements: ReportTag[] = Array.from(new Map(mergedElements.map(tag => [tag.id, tag])).values());
          existingGroup.elements = uniqueElements;
        }
      } else {
        groupMap.set(group.id, { ...group, elements: [...group.elements] });
      }
    });

    return Array.from(groupMap.values());
  }

  private parseReportFields(fields: { [key: string]: any }): { [key: string]: any } {
    let f: { [key: string]: any } = {};

    const groupIds = new Set(this.configService.tagGroups.map((group: TagGroup) => group.id));

    Object.keys(fields).forEach((key: string) => {
      if (groupIds.has(key) && Array.isArray(fields[key])) {
        f[key] = fields[key].map((tag: string) => tag);
      } else {
        f[key] = fields[key];
      }
    });

    return f;
  }


  private parseParentReportOperation(operation: OperationDb): Operation {
    let o = Operation.createEmpty();

    if (operation.date !== undefined) o.date = operation.date.toDate();
    if (operation.operatorName !== undefined) o.operatorName = operation.operatorName;
    if (operation.type !== undefined) {
      switch (operation.type) {
        case 'inspectionVertical':
          o.type = OPERATIONTYPE.InspectionVertical;
          break;
        case 'inspectionHorizontal':
          o.type = OPERATIONTYPE.InspectionHorizontal;
          break;
        default:
          o.type = OPERATIONTYPE.Maintenance;
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

      for (const key in childReport.fields) {
        if (key === 'foto_dettaglio' || key === 'photo_detail' || key === 'maintenance_photo' || key === 'intervention_photo') {
          if (Array.isArray(childReport.fields[key]))
            childReport.fields[key].forEach((url: string) => {
              let imgRef = this.getImageReference(url);
              this.deleteImage(imgRef);
            });
        }
      }

      await deleteDoc(doc(this.db, 'reportChildren', id));
      const parentRef = doc(this.db, 'reportParents', childReport.parentId);
      await setDoc(parentRef, { childrenIds: arrayRemove(childReport.id) }, { merge: true });
    } catch (error) {
      console.error(error);
    }
  }

  public async setChildReportById(id: string, data: any): Promise<void> {
    console.log('Data', data);
    console.log('id', id);

    try {
      const ref = doc(this.db, 'reportChildren', id);
      await setDoc(ref, data);
    } catch (error) {
      console.error(error);
    }
  }

  public async addChildReport(data: any): Promise<void> {
    const ref = collection(this.db, 'reportChildren');
    await addDoc(ref, data).then(async (res: any) => {
      const parentRef = doc(this.db, 'reportParents', data.parentId);
      await setDoc(parentRef, { childrenIds: arrayUnion(res.id) }, { merge: true });
    });
  }

  private parseChildReport(id: string, report: ReportChildDb): ReportChild {
    let r = ReportChild.createEmpty();

    r.isClosed = report.closure;
    r.creationTime = report.creationTime.toDate();
    r.fields = report.fields;
    r.fields = this.parseReportFields(report.fields);
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
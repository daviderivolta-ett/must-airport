import { Injectable, WritableSignal, effect, signal } from '@angular/core';
import { Inspection, InspectionLink, OPERATIONTYPE, inspectionConverter, inspectionLinkConverter } from '../models/operation.model';
import { CollectionReference, DocumentData, DocumentReference, Query, QueryDocumentSnapshot, QuerySnapshot, Timestamp, addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';

export interface InspectionFormData {
  date: string;
  operator: string;
  type: string;
}

export interface OperationsFiltersFormData {
  type: string,
  initialDate: string,
  endingDate: string
}

export interface ParsedOperationsFiltersFormData {
  type: string,
  initialDate: Date | null,
  endingDate: Date | null
}

@Injectable({
  providedIn: 'root'
})
export class OperationsService {
  public operationsSignal: WritableSignal<Inspection[]> = signal([]);
  public operations: Inspection[] = [];

  public filteredOperationsSignal: WritableSignal<Inspection[]> = signal([]);
  public filteredOperations: Inspection[] = [];

  constructor(private db: Firestore) {
    effect(() => this.operations = this.operationsSignal());
  }

  public async getAllInspections(): Promise<Inspection[]> {
    const inspections: Inspection[] = [];
    const q: Query = query(collection(this.db, 'inspections')).withConverter(inspectionConverter);
    const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);
    snapshot.forEach((result: QueryDocumentSnapshot) => {
      inspections.push(result.data() as Inspection);
    });
    return inspections
  }

  public async getAllInspectionsByReportId(id: string): Promise<Inspection[]> {
    const inspections: Inspection[] = [];
    const q: Query = query(collection(this.db, 'inspections'), where('reportParentId', '==', id)).withConverter(inspectionConverter);
    const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);
    snapshot.forEach((result: QueryDocumentSnapshot) => {
      inspections.push(result.data() as Inspection);
    });
    return inspections;
  }

  public async setOperationLink(inspectionLink: InspectionLink): Promise<string> {
    const ref: CollectionReference<DocumentData> = collection(this.db, 'links').withConverter(inspectionLinkConverter);
    const docRef: DocumentReference = await addDoc(ref, inspectionLink);
    return docRef.id;
  }

  public async deleteOperationLinkById(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'links', id));
  }

  public async setInspection(inspection: Inspection): Promise<string> {
    const ref: CollectionReference<DocumentData> = collection(this.db, 'inspections').withConverter(inspectionConverter);
    const docRef: DocumentReference = await addDoc(ref, inspection);
    return docRef.id;
  }

  public async deleteInspectionById(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'inspections', id));
  }

  public parseOperationsFiltersFormData(data: OperationsFiltersFormData): ParsedOperationsFiltersFormData {
    let o: ParsedOperationsFiltersFormData = {
      type: data.type,
      initialDate: data.initialDate ? new Date(data.initialDate) : null,
      endingDate: data.endingDate ? new Date(data.endingDate) : null
    }

    return o;
  }

  public filterOperations(filters: ParsedOperationsFiltersFormData): void {
    let filteredOperations: Inspection[] = this.operations.slice();

    for (const key in filters) {
      if (key === 'type') {
        if (filters[key] === 'inspection') filteredOperations = filteredOperations.filter(operation =>
          operation.type === OPERATIONTYPE.InspectionHorizontal ||
          operation.type === OPERATIONTYPE.InspectionVertical ||
          operation.type === OPERATIONTYPE.Inspection);
        if (filters[key] === 'maintenance') filteredOperations = filteredOperations.filter(operation => operation.type === OPERATIONTYPE.Maintenance);
      }

      if (key === 'initialDate' && filters[key] !== null) {
        filteredOperations = filteredOperations.filter(operation => filters.initialDate ? operation.date > filters.initialDate : operation);
      }

      if (key === 'endingDate' && filters[key] !== null) {
        filteredOperations = filteredOperations.filter(operation => filters.endingDate ? operation.date < filters.endingDate : operation);
      }
    }

    this.filteredOperationsSignal.set(filteredOperations);
  }
}
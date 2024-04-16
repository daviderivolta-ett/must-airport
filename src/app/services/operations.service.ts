import { Injectable, WritableSignal, effect, signal } from '@angular/core';
import { OPERATIONTYPE, Operation, OperationDb, OperationLink, OperationLinkDb } from '../models/operation.model';
import { Timestamp, addDoc, collection, deleteDoc, doc, getDoc } from 'firebase/firestore';
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
  public operationsSignal: WritableSignal<Operation[]> = signal([]);
  public operations: Operation[] = [];

  public filteredOperationsSignal: WritableSignal<Operation[]> = signal([]);
  public filteredOperations: Operation[] = [];

  constructor(private db: Firestore) {
    effect(() => this.operations = this.operationsSignal());
  }

  public async getOperationById(id: string): Promise<OperationLinkDb> {
    console.log(id);    
    const q = doc(this.db, 'links', id);
    const snapshot = await getDoc(q);
    if (snapshot.exists()) {
      return snapshot.data() as OperationLinkDb;
    } else {
      throw new Error('Operazione non trovata');
    }
  }

  public async setOperationLink(operationLink: any): Promise<string> {
    const docRef = await addDoc(collection(this.db, 'links'), operationLink);
    return docRef.id;
  }

  public async deleteOperationLinkById(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'links', id));
  }

  public parseOperationFormData(formData: any): OperationDb {
    let operation: OperationDb = {
      operatorName: formData.operator,
      date: Timestamp.fromDate(new Date(formData.date)),
      type: formData.type,
      id: new Date(formData.date).valueOf().toString() + new Date(Date.now()).valueOf().toString(),
      operationLink: ''
    }
    return operation;
  }

  public reParseOperationLink(operationLink: OperationLink): any {
    let o: any = {
      childFlowId: operationLink.childFlowId,
      reportParentId: operationLink.reportParentId,
      type: operationLink.type,
      verticalId: operationLink.verticalId
    }
    return o;
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
    let filteredOperations: Operation[] = this.operations.slice();

    for (const key in filters) {
      if (key === 'type') {      
        if (filters[key] !== 'all') filteredOperations = filteredOperations.filter(operation => operation.type === filters[key]);
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
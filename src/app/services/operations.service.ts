import { Injectable } from '@angular/core';
import { OperationDb, OperationLink } from '../models/operation.model';
import { Timestamp, addDoc, collection, deleteDoc, doc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';

export interface InspectionFormData {
  date: string;
  operator: string;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class OperationsService {

  constructor(private db: Firestore) { }

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
}
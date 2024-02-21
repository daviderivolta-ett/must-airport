import { Injectable } from '@angular/core';
import { OperationDb } from '../models/operation.model';
import { Timestamp } from 'firebase/firestore';

export interface InspectionFormData {
  date: string;
  operator: string;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class InspectionsService {

  constructor() { }

  public parseInspectionFormData(formData: any): OperationDb {
    let operation: OperationDb = {
      operatorName: formData.operator,
      date: Timestamp.fromDate(new Date(formData.date)),
      type: formData.type,
      id: new Date(formData.date).valueOf().toString() + new Date(Date.now()).valueOf().toString()
    }
    return operation;
  }
}
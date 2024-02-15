import { Injectable } from '@angular/core';

export interface inspectionFormData {
  date: string;
  operator: string;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class InspectionsService {

  constructor() { }

  public parseInspectionFormData(formData: any): any {
    let operation: any = {
      operatorName: formData.operator,
      date: new Date(formData.date).getTime(),
      type: formData.type
    }
    return operation;
  }
}
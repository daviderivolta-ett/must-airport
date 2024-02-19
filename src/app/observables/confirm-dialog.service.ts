import { Injectable } from '@angular/core';
import { ReportChild } from '../models/report-child.model';
import { ReportParent } from '../models/report-parent.model';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  public parentReport: ReportParent = ReportParent.createEmpty();
  public childReport: ReportChild = ReportChild.createEmpty();
  
  constructor() { }
}

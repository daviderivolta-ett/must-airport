import { Injectable } from '@angular/core';
import { ReportParent } from '../models/report-parent.model';

@Injectable({
  providedIn: 'root'
})
export class ArchiveDialogService {
  public parentReport: ReportParent = ReportParent.createEmpty();

  constructor() { }
}

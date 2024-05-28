import { Injectable, WritableSignal, signal } from '@angular/core';
import { ReportParent } from '../models/report-parent.model';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  public report: WritableSignal<ReportParent> = signal(ReportParent.createEmpty());
  public isOpen: WritableSignal<boolean> = signal(false);

  constructor() { }
}

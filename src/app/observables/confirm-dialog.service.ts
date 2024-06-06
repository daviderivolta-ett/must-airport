import { ApplicationRef, ComponentRef, Injectable, WritableSignal, createComponent, signal } from '@angular/core';
import { ReportChild } from '../models/report-child.model';
import { ReportParent } from '../models/report-parent.model';
import { ConfirmComponent } from '../components/confirm/confirm.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  public parentReport: ReportParent = ReportParent.createEmpty();
  public childReport: ReportChild = ReportChild.createEmpty();

  public confirmUploadReportFileSignal: WritableSignal<boolean | null> = signal(null);

  constructor(private applicationRef: ApplicationRef) { }

  public createConfirm(message: string) {
    const div: HTMLDivElement = document.createElement('div');
    div.id = 'confirm';
    document.body.append(div);
    const componentRef: ComponentRef<ConfirmComponent> = createComponent(ConfirmComponent, { hostElement: div, environmentInjector: this.applicationRef.injector });
    componentRef.instance.message = message;
    this.applicationRef.attachView(componentRef.hostView);
    componentRef.changeDetectorRef.detectChanges();
  }
}

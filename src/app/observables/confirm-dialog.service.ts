import { ApplicationRef, ComponentRef, Injectable, WritableSignal, createComponent, signal } from '@angular/core';
import { ConfirmComponent } from '../components/confirm/confirm.component';
import { CONFIRMDIALOG } from '../models/confirm-dialog.model';
import { ReportParent } from '../models/report-parent.model';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  public childReportToDelete: string | null = null;
  public parentReportToArchive: ReportParent | null = null;

  public deleteReportSignal: WritableSignal<boolean | null> = signal(null);
  public archiveReportSignal: WritableSignal<boolean | null> = signal(null);
  public unarchiveReportSignal: WritableSignal<boolean | null> = signal(null);
  public reopenReportSignal: WritableSignal<boolean | null> = signal(null);
  public uploadFileSignal: WritableSignal<boolean | null> = signal(null);
  public deleteChildReportSignal: WritableSignal<boolean | null> = signal(null);

  constructor(private applicationRef: ApplicationRef) { }

  public createConfirm(message: string, type: CONFIRMDIALOG) {
    const div: HTMLDivElement = document.createElement('div');
    div.id = 'confirm';
    document.body.append(div);
    const componentRef: ComponentRef<ConfirmComponent> = createComponent(ConfirmComponent, { hostElement: div, environmentInjector: this.applicationRef.injector });
    componentRef.instance.message = message;
    componentRef.instance.type = type;
    this.applicationRef.attachView(componentRef.hostView);
    componentRef.changeDetectorRef.detectChanges();
  }
}

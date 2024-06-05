import { ApplicationRef, Injectable, WritableSignal, createComponent, effect, signal } from '@angular/core';
import { ReportParent } from '../models/report-parent.model';
import { ReportDialogComponent } from '../pages/map/report-dialog/report-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  public report: WritableSignal<ReportParent> = signal(ReportParent.createEmpty());
  public isOpen: WritableSignal<boolean> = signal(false);

  constructor(private applicationRef: ApplicationRef) {
    effect(() => {     
      // this.isOpen() ? this.createDialog() : this.removeDialog();
    });
  }

  public createDialog(): void {
    const div: HTMLDivElement = document.createElement('div');
    div.id = 'report-dialog';
    document.body.appendChild(div);

    const componentRef = createComponent(ReportDialogComponent, {
      hostElement: div,
      environmentInjector: this.applicationRef.injector
    });

    this.applicationRef.attachView(componentRef.hostView);
    componentRef.changeDetectorRef.detectChanges();
  }

  public removeDialog(): void {
    const div: HTMLDivElement | null = document.querySelector('#report-dialog');
    if (div) div.remove();
  }
}

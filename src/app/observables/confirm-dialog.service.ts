import { ApplicationRef, ComponentRef, Injectable, WritableSignal, createComponent, signal } from '@angular/core';
import { ConfirmComponent } from '../components/confirm/confirm.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  public confirmUploadReportFileSignal: WritableSignal<boolean | null> = signal(null);
  public confirmDeleteChildReportSignal: WritableSignal<boolean | null> = signal(null);
  public childReportToDelete: WritableSignal<string | null> = signal(null);

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

import { ApplicationRef, Injectable, WritableSignal, createComponent, effect, signal } from '@angular/core';
import { SnackbarComponent } from '../components/snackbar/snackbar.component';
import { SNACKBAROUTCOME, SNACKBARTYPE } from '../models/snackbar.model';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  public msg: string = '';
  public type: SNACKBARTYPE = SNACKBARTYPE.Closable;

  constructor(private applicationRef: ApplicationRef) {}

  public createSnackbar(msg: string, type: SNACKBARTYPE = SNACKBARTYPE.Closable, outcome: SNACKBAROUTCOME = SNACKBAROUTCOME.Success): void {
    this.msg = msg;
    this.type = type;

    const div = document.createElement('div');
    div.id = 'snackbar';
    div.classList.add(outcome);
    document.body.append(div);
    const componentRef = createComponent(SnackbarComponent, { hostElement: div, environmentInjector: this.applicationRef.injector });
    this.applicationRef.attachView(componentRef.hostView);
    componentRef.changeDetectorRef.detectChanges();
  }
}

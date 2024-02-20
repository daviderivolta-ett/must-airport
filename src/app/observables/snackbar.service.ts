import { ApplicationRef, Injectable, createComponent } from '@angular/core';
import { SnackbarComponent } from '../components/snackbar/snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  public msg: string = '';

  constructor(private applicationRef: ApplicationRef) { }

  public createSnackbar(msg: string, outcome: string = 'success'): void {
    this.msg = msg;

    const div = document.createElement('div');
    div.id = 'snackbar';
    div.classList.add(outcome);
    document.body.append(div);
    const componentRef = createComponent(SnackbarComponent, { hostElement: div, environmentInjector: this.applicationRef.injector });
    this.applicationRef.attachView(componentRef.hostView);
    componentRef.changeDetectorRef.detectChanges();
  }
}

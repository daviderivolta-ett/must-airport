import { Component } from '@angular/core';
import { SnackbarService } from '../../observables/snackbar.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SNACKBARTYPE } from '../../models/snackbar.model';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [],
  templateUrl: './snackbar.component.html',
  styleUrl: './snackbar.component.scss',
  animations: [
    trigger('flyIn', [
      state('in', style({
        transform: 'translate(-50%, 0)'
      })),
      transition('void => *', [
        style({
          transform: 'translate(-50%, 100%)'
        }),
        animate('.1s cubic-bezier(.47,1.64,.41,.8)')
      ])
    ])
  ]
})
export class SnackbarComponent {
  public msg: string;
  public host: HTMLElement[] = Array.from(document.querySelectorAll('#snackbar'));

  constructor(private snackbarService: SnackbarService) {
    this.msg = this.snackbarService.msg;
    if (this.snackbarService.type === SNACKBARTYPE.Loader) setTimeout(() => { this.close() }, 1000);
  }

  public close(): void {
    this.host?.forEach(el => el.remove());
  }
}

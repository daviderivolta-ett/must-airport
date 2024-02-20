import { Component } from '@angular/core';
import { SnackbarService } from '../../observables/snackbar.service';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [],
  templateUrl: './snackbar.component.html',
  styleUrl: './snackbar.component.scss'
})
export class SnackbarComponent {
  public msg: string;
  public host: HTMLElement[] = Array.from(document.querySelectorAll('#snackbar'));

  constructor(private snackbarService: SnackbarService) {
    this.msg = this.snackbarService.msg;
    // setTimeout(() => { this.close() }, 2000);
  }

  public close(): void {
    this.host?.forEach(el => el.remove());
  }
}

import { Component } from '@angular/core';
import { ConfirmDialogService } from '../../observables/confirm-dialog.service';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [],
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.scss'
})
export class ConfirmComponent {
  public message: string = '';

  constructor(private confirmDialogService: ConfirmDialogService) { }

  public onSubmit(event: Event, response: boolean): void {
    event.stopPropagation();
    this.confirmDialogService.confirmUploadReportFileSignal.set(response);
    this.close();
  }

  public close(): void {
    const host: HTMLDivElement | null = document.querySelector('#confirm');
    if (!host) return;
    host.remove();
  }
}

import { Component } from '@angular/core';
import { ConfirmDialogService } from '../../observables/confirm-dialog.service';
import { CONFIRMDIALOG } from '../../models/confirm-dialog.model';
import { ReportsService } from '../../services/reports.service';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [],
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.scss'
})
export class ConfirmComponent {
  public message: string = '';
  public type: CONFIRMDIALOG | null = null;

  constructor(
    private confirmDialogService: ConfirmDialogService,
    private reportsService: ReportsService
  ) { }

  public onSubmit(event: Event, response: boolean): void {
    event.stopPropagation();
    if (response === true) this.handleConfirm(this.type);
    this.close();
  }

  public close(): void {
    const host: HTMLDivElement | null = document.querySelector('#confirm');
    if (!host) return;
    host.remove();
  }

  public handleConfirm(type: CONFIRMDIALOG | null): void {
    if (!type) return;

    switch (type) {
      case CONFIRMDIALOG.DeleteReport:
        this.confirmDialogService.deleteReportSignal.set(true);
        break;
        
      case CONFIRMDIALOG.ArchiveReport:
        this.confirmDialogService.archiveReportSignal.set(true);
        break;

      case CONFIRMDIALOG.UnarchiveReport:
        this.confirmDialogService.unarchiveReportSignal.set(true);
        break;

      case CONFIRMDIALOG.ReopenReport:
        this.confirmDialogService.reopenReportSignal.set(true);
        break;

      case CONFIRMDIALOG.UploadFile:
        this.confirmDialogService.uploadFileSignal.set(true);
        break;

      case CONFIRMDIALOG.DeleteChildReport:
        this.confirmDialogService.deleteChildReportSignal.set(true);
        break;

      default:
        break;
    }
  }
}

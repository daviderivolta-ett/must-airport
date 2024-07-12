import { Component, Input, effect } from '@angular/core';
import { ConfirmDialogService } from '../../observables/confirm-dialog.service';
import { Timestamp } from 'firebase/firestore';
import { ReportsService } from '../../services/reports.service';
import { ReportParent } from '../../models/report-parent.model';
import { SnackbarService } from '../../observables/snackbar.service';
import { Router } from '@angular/router';
import { SNACKBAROUTCOME, SNACKBARTYPE } from '../../models/snackbar.model';
import { CONFIRMDIALOG } from '../../models/confirm-dialog.model';

@Component({
  selector: 'app-archive-report',
  standalone: true,
  imports: [],
  templateUrl: './archive-report.component.html',
  styleUrl: './archive-report.component.scss'
})
export class ArchiveReportComponent {
  @Input() report: ReportParent = ReportParent.createEmpty();

  constructor(
    private router: Router,
    private reportsService: ReportsService,
    private snackbarService: SnackbarService,
    private confirmDialogService: ConfirmDialogService
  ) {
    effect(async () => {
      if (this.confirmDialogService.archiveReportSignal() !== true) return;

      const reportDb: any = {
        archived: true,
        archivingTime: Timestamp.now()
      }

      try {
        await this.reportsService.setReportById(this.report.id, reportDb);
        this.snackbarService.createSnackbar('Segnalazione archiviata con successo.', SNACKBARTYPE.Closable, SNACKBAROUTCOME.Success);
        this.router.navigate(['/archivio']);
      } catch (error) {
        this.snackbarService.createSnackbar('Errore nell\'archiviazione della segnalazione.', SNACKBARTYPE.Closable, SNACKBAROUTCOME.Error);
      }

      this.confirmDialogService.archiveReportSignal.set(null);
    });
  }

  public async handleClick(): Promise<void> {
    this.confirmDialogService.parentReportToArchive = this.report;
    this.confirmDialogService.createConfirm('Vuoi archiviare la segnalazione?', CONFIRMDIALOG.ArchiveReport);
  }
}

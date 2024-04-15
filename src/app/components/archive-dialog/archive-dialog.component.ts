import { Component, ElementRef } from '@angular/core';
import { ReportParent } from '../../models/report-parent.model';
import { ReportsService } from '../../services/reports.service';
import { ArchiveDialogService } from '../../observables/archive-dialog.service';
import { Timestamp } from 'firebase/firestore';
import { SnackbarService } from '../../observables/snackbar.service';
import { SNACKBAROUTCOME, SNACKBARTYPE } from '../../models/snackbar.model';
import { Router } from '@angular/router';

interface closingReportData {
  archived: boolean,
  archivingTime: Timestamp
}

@Component({
  selector: 'app-archive-dialog',
  standalone: true,
  imports: [],
  templateUrl: './archive-dialog.component.html',
  styleUrl: './archive-dialog.component.scss'
})
export class ArchiveDialogComponent {
  public host: HTMLElement | null = document.querySelector('#archive-dialog');
  public parentReport: ReportParent = ReportParent.createEmpty();

  constructor(private el: ElementRef, private router: Router, private reportsService: ReportsService, private archiveDialogService: ArchiveDialogService, private snackbarService: SnackbarService) {
    this.parentReport = this.archiveDialogService.parentReport;
  }

  public async confirm(): Promise<void> {
    const reportDb: closingReportData = {
      archived: true,
      archivingTime: Timestamp.now()
    }

    try {
      await this.reportsService.setReportById(this.parentReport.id, reportDb);
      this.snackbarService.createSnackbar('Segnalazione archiviata con successo.', SNACKBARTYPE.Closable, SNACKBAROUTCOME.Success);
      this.router.navigate(['/archivio']);
    } catch (error) {
      this.snackbarService.createSnackbar('Errore nell\'archiviazione della segnalazione.', SNACKBARTYPE.Closable, SNACKBAROUTCOME.Error);
    }

    this.close();
  }

  public cancel(): void {
    this.close();
  }

  public close(): void {
    if(this.host) this.host.remove();
  }
}

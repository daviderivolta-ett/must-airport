import { Component, Input, effect } from '@angular/core';
import { ReportParent } from '../../models/report-parent.model';
import { ReportChild } from '../../models/report-child.model';
import { Inspection } from '../../models/operation.model';
import { ReportFile } from '../../models/report-file.model';
import { ReportsService } from '../../services/reports.service';
import { OperationsService } from '../../services/operations.service';
import { ReportFileService } from '../../services/report-file.service';
import { Router } from '@angular/router';
import { SnackbarService } from '../../observables/snackbar.service';
import { SNACKBAROUTCOME, SNACKBARTYPE } from '../../models/snackbar.model';
import { ConfirmDialogService } from '../../observables/confirm-dialog.service';
import { CONFIRMDIALOG } from '../../models/confirm-dialog.model';

@Component({
  selector: 'app-delete-report',
  standalone: true,
  imports: [],
  templateUrl: './delete-report.component.html',
  styleUrl: './delete-report.component.scss'
})
export class DeleteReportComponent {
  private _report: ReportParent = ReportParent.createEmpty();
  public get report(): ReportParent {
    return this._report;
  }
  @Input() public set report(value: ReportParent) {
    if (!value) return;
    this._report = value;

    this.loadOperations();
    this.loadFiles();
  }

  @Input() public childReports: ReportChild[] = [];
  public operations: Inspection[] = [];
  public files: ReportFile[] = [];

  constructor(
    private router: Router,
    private operationsService: OperationsService,
    private reportsService: ReportsService,
    private reportFileService: ReportFileService,
    private snackbarService: SnackbarService,
    private confirmDialogService: ConfirmDialogService
  ) {

    effect(async () => {
      if (this.confirmDialogService.deleteReportSignal() !== true) return;
      const promises = [];

      const operationsPromises: Promise<void>[] = this.operations.map(async (operation: Inspection) => {
        await this.operationsService.deleteInspectionById(operation.id);
        await this.operationsService.deleteOperationLinkById(operation.linkId);
        await this.reportsService.removeOperationByReportId(this.report.id, operation.id);
      });

      const filesPromises: Promise<void>[] = this.files.map(async (file: ReportFile) => {
        await this.reportFileService.deleteFile(file.vertId, file.fileName);
      });

      promises.push(...operationsPromises, ...filesPromises);

      if (this.report.files) {
        const reportFilesPromises: Promise<void>[] = this.report.files.map(async (id: string) => {
          await this.reportFileService.deleteReportFile(id);
        });
        promises.push(...reportFilesPromises);
      }

      const childPromises: Promise<void>[] = this.childReports.map(async (report: ReportChild) => {
        await this.reportsService.deleteChildReportById(report.id);
      });

      promises.push(...childPromises);

      await Promise.all(promises);

      await this.reportsService.deleteReport(this.report);

      this.router.navigate(['/segnalazioni']);
      this.snackbarService.createSnackbar('Segnalazione cancellata con successo', SNACKBARTYPE.Closable, SNACKBAROUTCOME.Success);
      this.confirmDialogService.deleteReportSignal.set(null);
    });
  }

  private async loadOperations(): Promise<void> {
    try {
      const operations: Inspection[] = await this.operationsService.getAllInspectionsByReportId(this.report.id);
      this.operations = [...operations];
    } catch (error) {
      console.error('Error loading operations:', error);
    }
  }

  private async loadFiles(): Promise<void> {
    if (!this._report.files) return;

    try {
      const files: ReportFile[] = await this.reportFileService.getAllReportFilesByReportId(this._report.id);
      this.files = [...files];
    } catch (error) {
      console.error('Error loading files:', error);
    }
  }

  public async handleClick(): Promise<void> {
    const message: string = `Sicuro di voler eliminare la segnalazione? Questa operazione non è reversibile.`;
    this.confirmDialogService.createConfirm(message, CONFIRMDIALOG.DeleteReport);
  }
}
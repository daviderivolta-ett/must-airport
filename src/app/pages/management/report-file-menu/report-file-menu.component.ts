import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, effect } from '@angular/core';
import { ReportFileMenuService } from '../../../observables/report-file-menu.service';
import { ClickOutsideDirective } from '../../../directives/click-outside.directive';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReportFileService } from '../../../services/report-file.service';
import { ReportsService } from '../../../services/reports.service';
import { AuthService } from '../../../services/auth.service';
import { ReportFile } from '../../../models/report-file.model';
import { Timestamp } from 'firebase/firestore';
import { ReportParent } from '../../../models/report-parent.model';
import { ConfirmDialogService } from '../../../observables/confirm-dialog.service';
import { VERTICAL } from '../../../models/vertical.model';
import { SnackbarService } from '../../../observables/snackbar.service';
import { SNACKBAROUTCOME, SNACKBARTYPE } from '../../../models/snackbar.model';
import { CONFIRMDIALOG } from '../../../models/confirm-dialog.model';
import { UploadTaskSnapshot } from 'firebase/storage';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-report-file-menu',
  standalone: true,
  imports: [ClickOutsideDirective, ReactiveFormsModule, NgStyle],
  templateUrl: './report-file-menu.component.html',
  styleUrl: './report-file-menu.component.scss',
  animations: [
    trigger('openClose', [
      state('open', style({
        display: 'block',
        visibility: 'visible',
        transform: 'scale(1)',
        transformOrigin: 'bottom right'
      })),
      state('closed', style({
        display: 'none',
        visibility: 'hidden',
        transform: 'scale(0)',
        transformOrigin: 'bottom right'
      })),
      transition('closed => open', [
        animate('0.25s cubic-bezier(.47,1.64,.41,.8)')
      ]),
      transition('open => closed', [
        animate('0.1s')
      ])
    ])
  ]
})
export class ReportFileMenuComponent {
  public isOpen: boolean = false;
  public file: File | null = null;
  public files: ReportFile[] = [];
  public uploadProgress: number = 0;

  private _report: ReportParent = ReportParent.createEmpty();
  public get report(): ReportParent {
    return this._report;
  }
  @Input() public set report(value: ReportParent) {
    if (!value || value.id.length === 0) return;
    this._report = value;

    if (this.report.files) this.reportFileService.getAllReportFilesByReportId(this.report.id)
      .then((files: ReportFile[]) => this.files = [...files]);
  }

  public uploadReportFileForm: FormGroup = this.fb.group({
    fileName: ['', [Validators.required, Validators.minLength(1)]]
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private reportFileMenuService: ReportFileMenuService,
    private reportFileService: ReportFileService,
    private confirmDialogService: ConfirmDialogService,
    private reportsService: ReportsService,
    private snackbarService: SnackbarService
  ) {
    effect(() => this.isOpen = this.reportFileMenuService.isOpenSignal());
    effect(async () => {
      if (this.confirmDialogService.uploadFileSignal() !== true) return;
      await this.overwriteReportFile(this.report);
      if (this.file && this.authService.currentApp) await this.uploadFile(this.file, this.authService.currentApp);
      this.emptyInput();

      this.confirmDialogService.uploadFileSignal.set(null);
    });
  }

  public closeDialog(): void {
    this.reportFileMenuService.isOpenSignal.set(false);
  }

  public async onFileChange(event: Event): Promise<void> {
    const inputElement: HTMLInputElement = event.target as HTMLInputElement;
    if (!inputElement.files) return;
    const file: any = inputElement.files[0];
    this.uploadReportFileForm.controls['fileName'].setValue(file.name);
  }

  public async handleSubmit(input: HTMLInputElement): Promise<void> {
    if (!input.files || !this.authService.currentApp) return;
    this.file = input.files[0];

    if (this.report.files && this.report.files.length > 0) {
      const message: string = 'Questo report ha già un file associato. Questa operazione lo sovrascriverà. Sicuro di voler procedere?';
      this.confirmDialogService.createConfirm(message, CONFIRMDIALOG.UploadFile);
    } else {
      await this.uploadFile(this.file, this.authService.currentApp);
      this.emptyInput();
    }
  }

  public async uploadFile(file: File, currentApp: VERTICAL) {
    try {
      const fileName: string = this.generateFileName(file);
      const url: string = await this.reportFileService.uploadFile(file, currentApp, fileName, this.handleProgress.bind(this));
      const fileObj: ReportFile = new ReportFile(fileName, url, file.name, Timestamp.now(), this.report.id, currentApp);
      const id: string = await this.reportFileService.setReportFile(fileObj);
      await this.reportsService.setReportFilesByReportId(this.report.id, id);
      this.snackbarService.createSnackbar('File caricato con successo', SNACKBARTYPE.Loader, SNACKBAROUTCOME.Success);
    } catch (error) {
      console.error('Error in file upload', error);
    }
  }

  private handleProgress(snapshot: UploadTaskSnapshot): void {
    this.uploadProgress = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
    if (snapshot.state !== 'running') this.uploadProgress = 0;
  }

  private generateFileName(file: File): string {
    const lastDotIndex: number = file.name.lastIndexOf('.');
    const name: string = file.name.slice(0, lastDotIndex).trim().replace(/\s/g, '_');
    const extension: string = file.name.slice(lastDotIndex + 1);
    return `${name}_${new Date().getTime().toString()}.${extension}`;
  }

  private emptyInput(): void {
    const input: HTMLInputElement | null = document.querySelector('#report-file-input');
    if (!input) return;
    input.value = '';
    this.file = null;
    this.uploadReportFileForm.reset();
  }

  private async overwriteReportFile(report: ReportParent): Promise<void> {
    if (!report.files || !this.authService.currentApp) return;

    const deleteFilePromises: Promise<void>[] = this.files.map((file: ReportFile) => this.reportFileService.deleteFile(report.verticalId, file.fileName));
    await Promise.all(deleteFilePromises);

    const deleteReportPromises: Promise<void>[] = report.files.map((id: string) => this.reportFileService.deleteReportFile(id));
    await Promise.all(deleteReportPromises);

    await this.reportsService.setReportById(report.id, { files: [] })
  }
}
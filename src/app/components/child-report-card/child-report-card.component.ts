import { DatePipe, KeyValuePipe, NgClass, NgStyle } from '@angular/common';
import { Component, ElementRef, Input, ViewChild, effect } from '@angular/core';
import { ReportChild } from '../../models/report-child.model';
import { ConfirmDialogService } from '../../observables/confirm-dialog.service';
import { ReportParent } from '../../models/report-parent.model';
import { LoggedUser } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ControlLabelPipe } from '../../pipes/control-label.pipe';
import { TagGroup } from '../../models/tag.model';
import { SentenceCasePipe } from '../../pipes/sentence-case.pipe';
import { CONFIRMDIALOG } from '../../models/confirm-dialog.model';

@Component({
  selector: 'app-child-report-card',
  standalone: true,
  imports: [
    DatePipe,
    NgStyle,
    NgClass,
    KeyValuePipe,
    ControlLabelPipe,
    SentenceCasePipe
  ],
  templateUrl: './child-report-card.component.html',
  styleUrl: './child-report-card.component.scss'
})
export class ChildReportCardComponent {
  @ViewChild('card') card: ElementRef | undefined;
  private _childReport: ReportChild = ReportChild.createEmpty();
  public get childReport(): ReportChild {
    return this._childReport;
  }
  @Input() set childReport(value: ReportChild) {
    if (!value) return;
    this._childReport = value;
    this.images = this.getReportImgs(value);
  }

  @Input() public parentReport: ReportParent = ReportParent.createEmpty();
  @Input() public childTagGroups: TagGroup[] = [];

  public images: string[] = [];
  public currentImg: number = 0

  public loggedUser: LoggedUser | null = null;
  public showDeleteBtn: boolean = false;

  constructor(
    private confirmDialogService: ConfirmDialogService,
    private router: Router,
    private authService: AuthService
  ) {
    effect(() => {
      this.loggedUser = this.authService.loggedUserSignal()
    });
  }

  public ngOnInit(): void {
    this.card?.nativeElement;
    if (this.router.url !== '/segnalazioni' && !this.router.url.includes('/archivio/')) this.showDeleteBtn = true;
  }

  public iconClick(): void {
    const message: string = `Sicuro di voler eliminare l'aggiornamento del ${this.childReport.creationTime.toLocaleDateString()}? Questa operazione non è reversibile.`;
    this.confirmDialogService.childReportToDelete = this.childReport.id;
    this.confirmDialogService.createConfirm(message, CONFIRMDIALOG.DeleteChildReport);
  }

  public hasMatchfingField(groupId: string): boolean {
    return Object.keys(this.childReport.fields).some(key => key === groupId);
  }

  public getTags(groupId: string): string[] {
    const field: string[] = this.childReport.fields[groupId];
    return field ? field : [];
  }

  public getReportImgs(report: ReportChild): string[] {
    let imgs: string[] = [];

    if (report.fields.foto_dettaglio) {
      imgs = [...report.fields.foto_dettaglio];
    } else if (report.fields.intervention_photo) {
      imgs = [...report.fields.intervention_photo];
    } else if (report.fields.photo_detail) {
      imgs = [...report.fields.photo_detail];
    } else if (report.fields.maintenance_photo) {
      imgs = [...report.fields.maintenance_photo];
    } else {
      imgs = [];
    }

    return imgs;
  }

  public changeImg(intent: 'prev' | 'next'): void {    
    const lastImg: number = this.images.length - 1;

    switch (intent) {
      case 'prev':
        let prevImg: number = this.currentImg - 1;
        prevImg < 0 ? this.currentImg = lastImg : this.currentImg = prevImg;
        break;

      default:
        let nextImg: number = this.currentImg + 1;
        nextImg > lastImg ? this.currentImg = 0 : this.currentImg = nextImg;
        break;
    }
  }
}

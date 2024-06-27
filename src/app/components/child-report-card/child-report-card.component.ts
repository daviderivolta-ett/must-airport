import { DatePipe, KeyValuePipe, NgClass } from '@angular/common';
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
  @Input() public childReport: ReportChild = ReportChild.createEmpty();
  @Input() public parentReport: ReportParent = ReportParent.createEmpty();
  @Input() public childTagGroups: TagGroup[] = [];

  public loggedUser: LoggedUser | null = null;
  public showDeleteBtn: boolean = false;

  constructor(
    private confirmDialogService: ConfirmDialogService,
    private router: Router,
    private authService: AuthService
  ) {
    effect(() => {
      this.loggedUser = this.authService.loggedUserSignal()
      console.log(this.loggedUser);      
    });
  }

  public ngOnInit(): void {
    this.card?.nativeElement;
    if (this.router.url !== '/segnalazioni') this.showDeleteBtn = true;
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
}

import { DatePipe, KeyValuePipe, NgClass } from '@angular/common';
import { ApplicationRef, Component, ElementRef, Input, ViewChild, createComponent, effect } from '@angular/core';
import { ReportChild } from '../../models/report-child.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from '../../observables/confirm-dialog.service';
import { ReportParent } from '../../models/report-parent.model';
import { ReportsService } from '../../services/reports.service';
import { LoggedUser } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ControlLabelPipe } from '../../pipes/control-label.pipe';
import { TagGroup } from '../../models/tag.model';
import { SentenceCasePipe } from '../../pipes/sentence-case.pipe';

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

  constructor(private applicationRef: ApplicationRef, private confirmDialogService: ConfirmDialogService, private reportsService: ReportsService, private router: Router, private authService: AuthService) {
    effect(() => this.loggedUser = this.authService.loggedUserSignal());
  }

  public ngOnInit(): void {
    this.card?.nativeElement;
    if (this.router.url !== '/segnalazioni') this.showDeleteBtn = true;    
  }

  public iconClick(): void {
    this.confirmDialogService.childReport = this.childReport;

    const div = document.createElement('div');
    div.id = 'confirm-dialog';
    document.body.append(div);
    const componentRef = createComponent(ConfirmDialogComponent, { hostElement: div, environmentInjector: this.applicationRef.injector });
    this.applicationRef.attachView(componentRef.hostView);
    componentRef.changeDetectorRef.detectChanges();
  }

  public hasMatchfingField(groupId: string): boolean {
    return Object.keys(this.childReport.fields).some(key => key === groupId);
  }

  public getTags(groupId: string): string[] {
    const field: string[] = this.childReport.fields[groupId];
    return field ? field : [];
  }
}

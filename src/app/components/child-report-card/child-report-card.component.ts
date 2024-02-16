import { DatePipe, NgClass } from '@angular/common';
import { ApplicationRef, Component, ElementRef, Input, ViewChild, createComponent } from '@angular/core';
import { ReportChild } from '../../models/report-child.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-child-report-card',
  standalone: true,
  imports: [DatePipe, NgClass],
  templateUrl: './child-report-card.component.html',
  styleUrl: './child-report-card.component.scss'
})
export class ChildReportCardComponent {
  @ViewChild('card') card: ElementRef | undefined;
  @Input() childReport: ReportChild = ReportChild.createEmpty();

  constructor(private applicationRef: ApplicationRef) { }

  public ngOnInit():void {
    this.card?.nativeElement;
  }

  iconClick(): void {
    const div = document.createElement('div');
    div.id = 'confirm-dialog';
    document.body.append(div);
    const componentRef = createComponent(ConfirmDialogComponent, { hostElement: div, environmentInjector: this.applicationRef.injector });
    this.applicationRef.attachView(componentRef.hostView);
    componentRef.changeDetectorRef.detectChanges();
  }
}

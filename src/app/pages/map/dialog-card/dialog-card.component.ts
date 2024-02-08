import { Component, Input } from '@angular/core';
import { ReportChild } from '../../../models/report-child.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dialog-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './dialog-card.component.html',
  styleUrl: './dialog-card.component.scss'
})
export class DialogCardComponent {
  @Input() childReport: ReportChild = ReportChild.createEmpty();
}

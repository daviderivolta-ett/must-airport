import { DatePipe, NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ReportChild } from '../../models/report-child.model';

@Component({
  selector: 'app-child-report-card',
  standalone: true,
  imports: [DatePipe, NgClass],
  templateUrl: './child-report-card.component.html',
  styleUrl: './child-report-card.component.scss'
})
export class ChildReportCardComponent {
  @Input() childReport: ReportChild = ReportChild.createEmpty();
}

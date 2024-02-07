import { Component, Input } from '@angular/core';
import { ReportParent } from '../../../models/report-parent.model';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-sidebar-card',
  standalone: true,
  imports: [NgClass],
  templateUrl: './sidebar-card.component.html',
  styleUrl: './sidebar-card.component.scss'
})
export class SidebarCardComponent {
  @Input()  public report: ReportParent = ReportParent.createEmpty();
}
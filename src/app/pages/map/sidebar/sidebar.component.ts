import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { SidebarService } from '../../../observables/sidebar.service';
import { ReportParent } from '../../../models/report-parent.model';
import { SidebarCardComponent } from '../sidebar-card/sidebar-card.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgClass, SidebarCardComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() public reports: ReportParent[] = [];

  constructor(public sidebarService: SidebarService) { }

  public toggleSidebar() {
    this.sidebarService.isOpen.set(!this.sidebarService.isOpen());
  }
}
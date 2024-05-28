import { Component, Input, effect } from '@angular/core';
import { NgClass } from '@angular/common';
import { SidebarService } from '../../../observables/sidebar.service';
import { ReportParent } from '../../../models/report-parent.model';
import { SidebarCardComponent } from '../sidebar-card/sidebar-card.component';
import { FiltersComponent } from '../filters/filters.component';
import { TagGroup } from '../../../models/tag.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgClass, SidebarCardComponent, FiltersComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() public reports: ReportParent[] = [];
  @Input() public parentTagGroups: TagGroup[] = [];
  public isOpen: boolean = false;

  constructor(private sidebarService: SidebarService) {
    effect(() => {
      this.isOpen = this.sidebarService.isOpen();   
    });
  }

  public toggleSidebar() {
    this.sidebarService.isOpen.set(!this.sidebarService.isOpen());
  }
}
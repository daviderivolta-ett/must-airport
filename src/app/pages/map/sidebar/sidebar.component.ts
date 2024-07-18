import { Component, EventEmitter, Input, Output, effect } from '@angular/core';
import { NgClass } from '@angular/common';
import { SidebarService } from '../../../observables/sidebar.service';
import { ReportParent } from '../../../models/report-parent.model';
import { SidebarCardComponent } from '../sidebar-card/sidebar-card.component';
import { FiltersComponent } from '../filters/filters.component';
import { TagGroup } from '../../../models/tag.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    NgClass,
    SidebarCardComponent,
    FiltersComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private _reports: ReportParent[] = [];
  public get reports(): ReportParent[] {
    return this._reports;
  }
  @Input() public set reports(value: ReportParent[]) {
    if (!value) return;
    this._reports = value;
  }

  @Input() public parentTagGroups: TagGroup[] = [];
  public isOpen: boolean = false;

  @Output() onFiltersChanged: EventEmitter<any> = new EventEmitter<any>();

  constructor(private sidebarService: SidebarService) {
    effect(() => this.isOpen = this.sidebarService.isOpen());
  }

  public toggleSidebar() {
    this.sidebarService.isOpen.set(!this.sidebarService.isOpen());
  }

  public filtersChanged(filters: any) {
    this.onFiltersChanged.emit(filters);
  }
}
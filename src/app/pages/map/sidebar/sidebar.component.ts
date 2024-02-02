import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { SidebarService } from '../../../observables/sidebar.service';
import { SidebarContentComponent } from '../sidebar-content/sidebar-content.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgClass, SidebarContentComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  constructor(public sidebarService: SidebarService) { }

  ngOnInit() { }

  public toggleSidebar() {
    this.sidebarService.isOpen.set(!this.sidebarService.isOpen());
  }
}
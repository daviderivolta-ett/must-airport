import { Component, effect } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ReportsService } from '../../../services/reports.service';
import { ReportParent } from '../../../models/report-parent.model';
import { TechElementTag } from '../../../models/tech-element-tag.model';
import { DialogComponent } from '../dialog/dialog.component';
import { AdditionLayersMenuToggleComponent } from '../addition-layers-menu-toggle/addition-layers-menu-toggle.component';
import { AdditionalLayersMenuComponent } from '../additional-layers-menu/additional-layers-menu.component';
import { LoggedUser } from '../../../models/user.model';
import { VERTICAL } from '../../../models/app-flow.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-map-page',
  standalone: true,
  imports: [MapComponent, SidebarComponent, DialogComponent, AdditionalLayersMenuComponent, AdditionLayersMenuToggleComponent],
  templateUrl: './map-page.component.html',
  styleUrl: './map-page.component.scss'
})
export class MapPageComponent {
  public loggedUser: LoggedUser | null = null;
  public currentApp: VERTICAL | null = null;
  public reports: ReportParent[] = [];
  public techElementTags: TechElementTag[] = [];

  constructor(private reportsService: ReportsService, private authService: AuthService) {
    effect(() => {
      this.reports = this.reportsService.reportsSignal();
      // console.log(this.reports);
    });

    effect(() => {
      this.reports = this.reportsService.filteredReportsSignal();
      // console.log(this.reports);      
    });

    effect(() => {
      this.loggedUser = this.authService.loggedUserSignal();
    });

    effect(() => {
      this.currentApp = this.authService.currentAppSignal();
    });
  }
}
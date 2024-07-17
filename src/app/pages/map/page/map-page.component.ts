import { Component, effect } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ReportsService } from '../../../services/reports.service';
import { ReportParent } from '../../../models/report-parent.model';
import { TechElementTag } from '../../../models/tech-element-tag.model';
import { DialogComponent } from '../dialog/dialog.component';
import { AdditionalLayersMenuComponent } from '../additional-layers-menu/additional-layers-menu.component';
import { LoggedUser } from '../../../models/user.model';
import { VERTICAL } from '../../../models/vertical.model';
import { AuthService } from '../../../services/auth.service';
import { ConfigService } from '../../../services/config.service';
import { WebAppConfig } from '../../../models/config.model';
import { TagGroup } from '../../../models/tag.model';

@Component({
  selector: 'app-map-page',
  standalone: true,
  imports: [
    MapComponent,
    SidebarComponent,
    DialogComponent,
    AdditionalLayersMenuComponent
  ],
  templateUrl: './map-page.component.html',
  styleUrl: './map-page.component.scss'
})
export class MapPageComponent {
  public config: WebAppConfig = WebAppConfig.createDefault();
  public childTagGroups: TagGroup[] | null = null;
  public parentTagGroups: TagGroup[] | null = null;
  public loggedUser: LoggedUser | null = null;
  public currentApp: VERTICAL | null = null;
  public reports: ReportParent[] = [];
  public filteredReports: ReportParent[] = [];
  public closedReports: ReportParent[] = [];
  public techElementTags: TechElementTag[] = [];

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private reportsService: ReportsService
  ) {
    effect(() => this.loggedUser = this.authService.loggedUserSignal());
    effect(() => this.currentApp = this.authService.currentAppSignal());
    effect(() => this.config = this.configService.configSignal());
    effect(() => {
      this.reports = this.reportsService.reportsSignal();
      this.filteredReports = [...this.reports.filter((report: ReportParent) => !report.closingChildId)];
    });
    effect(() => this.parentTagGroups = this.configService.parentTagGroupsSignal());
    effect(() => this.childTagGroups = this.configService.childTagGroupsSignal());
  }

  public reportFiltersChanged(filters: any): void {
    this.filteredReports = [...this.reportsService.filterParentReports(filters)];
  }
}
import { Component, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { AuthService } from './services/auth.service';
import { FirebaseService } from './services/firebase.service';
import { ReportsService } from './services/reports.service';
import { APPFLOW } from './models/app-flow.model';
import { CodesService } from './services/codes.service';
import { SettingsService } from './services/settings.service';
import { ThemeService } from './services/theme.service';
import { AppSettings } from './models/settings.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'must';

  constructor(private firebaseService: FirebaseService, private authService: AuthService, private reportsService: ReportsService, private codesService: CodesService, private settingsService: SettingsService, private themeService: ThemeService) {
    effect(() => {
      if (this.authService.loggedUserSignal() !== null) {
        if (!this.authService.loggedUser) return;
        // console.log(this.authService.loggedUser);
        this.authService.loggedUser && this.authService.loggedUser.lastApp ? this.reportsService.getAllParentReports(this.authService.loggedUser.lastApp) : this.reportsService.getAllParentReports(APPFLOW.Default);
        this.codesService.getAllCodes();

        this.settingsService.getAllSettings(this.authService.loggedUser.lastApp).subscribe((settings: AppSettings) => {
          this.settingsService.settingsSignal.set(settings);
          // this.themeService.setTheme(settings.styles);
        });
      } else {
        this.reportsService.reports = [];
      }
    });
  }

  async ngOnInit() {
    // await this.reportsService.getAllParentReports();   
  }
}

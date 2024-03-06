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
import { SplashService } from './observables/splash.service';
import { USERLEVEL } from './models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  public title: string = 'must';

  constructor(private firebaseService: FirebaseService, private authService: AuthService, private reportsService: ReportsService, private codesService: CodesService, private settingsService: SettingsService, private themeService: ThemeService, private splashService: SplashService) {
    this.splashService.createSplash();
    effect(() => this.codesService.getAllCodes());
    effect(() => {
      if (this.authService.loggedUserSignal() !== null) {
        if (!this.authService.loggedUser) return;
        // console.log(this.authService.loggedUser);
        // console.log(this.codesService.codes);

        let isAuthorized: boolean = false;
        this.authService.loggedUser.level === USERLEVEL.Superuser ? isAuthorized = true : isAuthorized = this.codesService.checkIfUserIsAuthorized(this.authService.loggedUser, this.authService.loggedUser.lastApp);
        if (isAuthorized) {
          this.reportsService.getAllParentReports(this.authService.loggedUser.lastApp);
        } else {
          this.authService.loggedUser.lastApp = APPFLOW.Default;
          this.reportsService.getAllParentReports(APPFLOW.Default);
        }

        this.settingsService.getAllSettings(this.authService.loggedUser.lastApp).subscribe((settings: AppSettings) => {
          this.settingsService.settingsSignal.set(settings);
          this.themeService.setTheme(settings.styles);
        });
        this.splashService.removeSplash();
      } else {
        this.reportsService.reports = [];
        this.splashService.removeSplash();
      }
    });
  }
}

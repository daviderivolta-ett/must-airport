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
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  public title: string = 'must';
  private currentApp: APPFLOW = APPFLOW.Default;

  constructor(private firebaseService: FirebaseService, private authService: AuthService, private reportsService: ReportsService, private codesService: CodesService, private userService: UserService, private settingsService: SettingsService, private themeService: ThemeService, private splashService: SplashService) {
    this.splashService.createSplash();
    this.codesService.getAllCodes();
    effect(() => {
      //
      // console.log(this.codesService.codes); 
      //
      
      if (this.authService.loggedUserSignal() !== null) {
        if (!this.authService.loggedUser) return;
        // this.codesService.checkIfUserIsAuthorized(this.authService.loggedUser, APPFLOW.Airport);
        // console.log(this.authService.loggedUser);
        this.authService.loggedUser && this.authService.loggedUser.lastApp ? this.reportsService.getAllParentReports(this.authService.loggedUser.lastApp) : this.reportsService.getAllParentReports(APPFLOW.Default);

        this.settingsService.getAllSettings(this.authService.loggedUser.lastApp).subscribe((settings: AppSettings) => {
          this.settingsService.settingsSignal.set(settings);
          this.themeService.setTheme(settings.styles);
        });
        this.splashService.removeSplash();
      } else {
        this.reportsService.reports = [];
      }
    });
  }

  async ngOnInit() {
    // await this.reportsService.getAllParentReports();   
  }
}

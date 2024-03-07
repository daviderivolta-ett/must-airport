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
import { LoggedUser, USERLEVEL, UserData } from './models/user.model';
import { UserService } from './services/user.service';
import { Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { SeedService } from './services/seed.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  public title: string = 'must';

  constructor(private firebaseService: FirebaseService, private authService: AuthService, private usersService: UserService, private reportsService: ReportsService, private codesService: CodesService, private settingsService: SettingsService, private themeService: ThemeService, private splashService: SplashService, private seedService: SeedService) {
    this.splashService.createSplash();
    this.codesService.getAllCodes();
    effect(async () => {
      if (this.authService.userSignal() === null) return;
      if (this.authService.user === null) return;
      const loggedUser = await this.createLoggedUser(this.authService.user);
      this.authService.loggedUserSignal.set(loggedUser);
    });

    effect(() => {
      if (this.authService.loggedUserSignal() === null) return;

      if (this.authService.loggedUser !== null) {
        console.log(this.authService.loggedUser);
        let isAuthorized: boolean = false;
        if (this.authService.loggedUser.level === USERLEVEL.Superuser) {
          isAuthorized = true;
        } else {
          isAuthorized = this.codesService.checkIfUserIsAuthorized(this.authService.loggedUser, this.authService.loggedUser.lastApp);
        }

        if (isAuthorized) {
          if (this.authService.loggedUser.level === USERLEVEL.Superuser) {
            this.reportsService.getAllParentReports(this.authService.loggedUser.lastApp, true);
          } else {
            if (this.authService.loggedUser.lastApp === APPFLOW.Default) {
              this.reportsService.getAllParentReports(this.authService.loggedUser.lastApp, false);
            } else {
              this.reportsService.getAllParentReports(this.authService.loggedUser.lastApp, true);
            }
          }
        } else {
          this.authService.loggedUser.lastApp = APPFLOW.Default;
          let userData: UserData = {
            userLevel: this.authService.loggedUser.level,
            lastLogin: Timestamp.fromDate(this.authService.loggedUser.lastLogin),
            lastApp: APPFLOW.Default
          }

          if (this.authService.loggedUser.email) this.usersService.setUserDataById(this.authService.loggedUser.id, userData);
          this.reportsService.getAllParentReports(APPFLOW.Default, false);
        }

        this.settingsService.getAllSettings(this.authService.loggedUser.lastApp).subscribe((settings: AppSettings) => {
          this.settingsService.settingsSignal.set(settings);
          this.themeService.setTheme(settings.styles);
        });
        this.splashService.removeSplash();
      } else {
        this.reportsService.reports = [];
        this.settingsService.getAllSettings(APPFLOW.Default).subscribe((settings: AppSettings) => {
          this.settingsService.settingsSignal.set(settings);
          this.themeService.setTheme(settings.styles);
        });
        this.splashService.removeSplash();
      }
    })
  }

  private async createLoggedUser(user: User): Promise<LoggedUser> {
    let loggedUser: LoggedUser;
    try {
      let userData: UserData = await this.usersService.getUserDataById(user.uid);
      userData.lastLogin = Timestamp.now();
      this.usersService.setUserDataById(user.uid, userData);
      userData.userLevel !== USERLEVEL.Superuser ? userData.apps = [APPFLOW.Default, ...this.codesService.getAppsByUserId(user.uid)] : userData.apps = Object.values(APPFLOW);
      loggedUser = this.usersService.parseUserData(user.uid, user, userData);
    } catch (error) {
      let data: UserData = {
        userLevel: USERLEVEL.User,
        lastLogin: Timestamp.fromDate(new Date(Date.now())),
        apps: [APPFLOW.Default],
        lastApp: APPFLOW.Default
      }

      if (!user.isAnonymous) this.usersService.setUserDataById(user.uid, data);
      loggedUser = this.usersService.parseUserData(user.uid, user, data);
    }
    return loggedUser;
  }
}
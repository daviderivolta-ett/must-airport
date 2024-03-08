import { Component, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { AuthService } from './services/auth.service';
import { FirebaseService } from './services/firebase.service';
import { ReportsService } from './services/reports.service';
import { VERTICAL } from './models/app-flow.model';
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

  constructor(private firebaseService: FirebaseService, private authService: AuthService, private userService: UserService, private reportsService: ReportsService, private codesService: CodesService, private settingsService: SettingsService, private themeService: ThemeService, private splashService: SplashService, private seedService: SeedService) {
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
      const loggedUser = this.authService.loggedUser;

      if (!loggedUser) return;
      if (!loggedUser.email) {
        this.authService.currentAppSignal.set(VERTICAL.Default);
        return;
      }

      if (!loggedUser.lastApp) {
        let data: UserData = {
          userLevel: loggedUser.level,
          lastLogin: Timestamp.fromDate(loggedUser.lastLogin),
          lastApp: VERTICAL.Default
        }
        this.userService.setUserDataById(loggedUser.id, data);
        this.authService.currentAppSignal.set(VERTICAL.Default);
      }

      this.authService.currentAppSignal.set(loggedUser.lastApp);
    }, { allowSignalWrites: true });

    effect(() => {
      if (this.authService.currentAppSignal() === null) return;
      const currentApp: VERTICAL | null = this.authService.currentApp;
      const loggedUser = this.authService.loggedUser;
      
      if (!currentApp || !loggedUser) return;

      this.splashService.createSplash();

      if (currentApp === VERTICAL.Default) {
        switch (loggedUser.level) {
          case USERLEVEL.Superuser:
            this.reportsService.getAllParentReports(currentApp, true);
            break;
          default:
            this.reportsService.getAllParentReports(currentApp, false);
            break;
        }
      } else {
        switch (loggedUser.level) {
          case USERLEVEL.Superuser:
            this.reportsService.getAllParentReports(currentApp, true);
            break;
          default:
            let isAuthorized: boolean = this.codesService.checkIfUserIsAuthorized(loggedUser, currentApp);
            if (isAuthorized) {
              this.reportsService.getAllParentReports(currentApp, true);
            } else {
              this.authService.currentAppSignal.set(VERTICAL.Default);
            }
            break;
        }
      }
      loggedUser.lastApp = currentApp;
      let userData: UserData = {
        userLevel: loggedUser.level,
        lastLogin: Timestamp.fromDate(loggedUser.lastLogin),
        lastApp: currentApp
      }
      this.userService.setUserDataById(loggedUser.id, userData);
      this.settingsService.getAllSettings(currentApp).subscribe((settings: AppSettings) => {
        this.settingsService.settingsSignal.set(settings);
        this.themeService.setTheme(settings.styles);
      });
      this.splashService.removeSplash();

    }, { allowSignalWrites: true });
  }

  private async createLoggedUser(user: User): Promise<LoggedUser> {
    let loggedUser: LoggedUser;
    try {
      let userData: UserData = await this.userService.getUserDataById(user.uid);
      userData.lastLogin = Timestamp.now();
      this.userService.setUserDataById(user.uid, userData);
      userData.userLevel !== USERLEVEL.Superuser ? userData.apps = [VERTICAL.Default, ...this.codesService.getAppsByUserId(user.uid)] : userData.apps = Object.values(VERTICAL);
      loggedUser = this.userService.parseUserData(user.uid, user, userData);
    } catch (error) {
      let data: UserData = {
        userLevel: USERLEVEL.User,
        lastLogin: Timestamp.fromDate(new Date(Date.now())),
        apps: [VERTICAL.Default],
        lastApp: VERTICAL.Default
      }

      if (!user.isAnonymous) this.userService.setUserDataById(user.uid, data);
      loggedUser = this.userService.parseUserData(user.uid, user, data);
    }
    return loggedUser;
  }
}
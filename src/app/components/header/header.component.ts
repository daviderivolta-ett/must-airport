import { Component, effect } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoggedUser } from '../../models/user.model';
import { AccountMenuComponent } from '../account-menu/account-menu.component';
import { HeaderService } from '../../observables/header.service';
import { SettingsService } from '../../services/settings.service';
import { AppSettings } from '../../models/settings.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AccountMenuComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  public loggedUser: LoggedUser | null = null;
  public settings: AppSettings | null = null;

  constructor(private headerService: HeaderService, private authService: AuthService, private settingsService: SettingsService) {
    effect(() => {
      this.loggedUser = this.authService.loggedUserSignal();
    });
    effect(() => {
      this.settings = this.settingsService.settingsSignal();
    });
  }

  public showAccountMenu(event: Event) {
    event.stopPropagation();
    this.headerService.isAccountMenuVisible.set(!this.headerService.isAccountMenuVisible());
  }

  public logOut(): void {
    this.authService.auth.signOut();
  }
}

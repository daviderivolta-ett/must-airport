import { Component, Input, effect } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoggedUser } from '../../models/user.model';
import { AccountMenuComponent } from '../account-menu/account-menu.component';
import { HeaderService } from '../../observables/header.service';
import { VERTICAL } from '../../models/vertical.model';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { ThemeService } from '../../services/theme.service';
import { COLORMODE } from '../../models/color-mode.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AccountMenuComponent, ThemeToggleComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() logoUrl: string = '';
  public loggedUser: LoggedUser | null = null;
  public currentApp: VERTICAL | null = null;
  public colorMode: COLORMODE | null = null;

  constructor(private headerService: HeaderService, private authService: AuthService, private themeService: ThemeService) {
    effect(() => {
      this.loggedUser = this.authService.loggedUserSignal();
    });
    effect(() => {
      this.currentApp = this.authService.currentAppSignal();
    });
    effect(() => {
      if (this.themeService.colorModeSignal() === null) return;
      this.colorMode = this.themeService.colorModeSignal();    
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

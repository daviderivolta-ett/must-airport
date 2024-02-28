import { Component, Input, effect } from '@angular/core';
import { LoggedUser, UserData } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { NgClass, TitleCasePipe } from '@angular/common';
import { HeaderService } from '../../observables/header.service';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { SnackbarService } from '../../observables/snackbar.service';
import { Router, RouterLink } from '@angular/router';
import { Timestamp } from 'firebase/firestore';
import { APPFLOW } from '../../models/app-flow.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-account-menu',
  standalone: true,
  imports: [NgClass, ClickOutsideDirective, TitleCasePipe, RouterLink],
  templateUrl: './account-menu.component.html',
  styleUrl: './account-menu.component.scss'
})
export class AccountMenuComponent {
  @Input() public loggedUser: LoggedUser | null = null;
  public isVisible: boolean = false;

  constructor(private headerService: HeaderService, private authService: AuthService, private snackbarService: SnackbarService, private router: Router, private userService: UserService) {
    effect(() => {
      this.isVisible = this.headerService.isAccountMenuVisible();
    });
  }

  public logOut(): void {
    this.headerService.isAccountMenuVisible.set(false);
    this.authService.auth.signOut();
    this.snackbarService.createSnackbar('Logout avvenuto con successo');
    this.router.navigate(['/login']);
  }

  public closeAccountMenu(): void {
    this.headerService.isAccountMenuVisible.set(false);
  }

  public reloadApp(selectedApp: APPFLOW): void {
    const user: LoggedUser | null = this.authService.loggedUser;
    if (!user) return;
    let userData: UserData = {
      userLevel: user.level,
      lastLogin: Timestamp.fromDate(user.lastLogin),
      apps: user.apps,
      lastApp: selectedApp
    }
    this.userService.setUserDataById(user.id, userData);
    window.location.reload();
  }
}
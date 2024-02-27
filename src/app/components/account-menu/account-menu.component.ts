import { Component, Input, effect } from '@angular/core';
import { LoggedUser } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { NgClass, TitleCasePipe } from '@angular/common';
import { HeaderService } from '../../observables/header.service';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { SnackbarService } from '../../observables/snackbar.service';
import { Router, RouterLink } from '@angular/router';

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

  constructor(private headerService: HeaderService, private authService: AuthService, private snackbarService: SnackbarService, private router: Router) {
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
}
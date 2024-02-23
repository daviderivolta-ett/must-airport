import { Component, effect } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoggedUser } from '../../models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  public loggedUser: LoggedUser | null = null;

  constructor(private authService: AuthService) {
    effect(() => {
      this.loggedUser = this.authService.loggedUserSignal();
    })
  }

  public logOut(): void {
    this.authService.auth.signOut();
  }
}

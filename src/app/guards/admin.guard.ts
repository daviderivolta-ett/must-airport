import { NgZone, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { USERLEVEL } from '../models/user.model';
import { VERTICAL } from '../models/app-flow.model';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const ngZone = inject(NgZone);
  const authService = inject(AuthService);

  return new Promise((resolve, reject) => {
    onAuthStateChanged(getAuth(), user => {
      if (authService.loggedUser && authService.loggedUser.level <= USERLEVEL.Admin) {
        if (authService.loggedUser.level === USERLEVEL.Superuser) {
          resolve(true);
        } else {
          authService.currentApp !== VERTICAL.Default ? resolve(true) : resolve(false);
        }
      } else {
        ngZone.run(() => router.navigate(['/segnalazioni']));
        resolve(false);
      }
    })
  });
};

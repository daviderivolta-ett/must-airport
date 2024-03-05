import { Injectable, WritableSignal, effect, signal, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, getAuth, signInAnonymously, onAuthStateChanged, User, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, AuthProvider } from 'firebase/auth';
import { UserService } from './user.service';
import { LoggedUser, USERLEVEL, UserData } from '../models/user.model';
import { Timestamp } from 'firebase/firestore';
import { SnackbarService } from '../observables/snackbar.service';
import { APPFLOW } from '../models/app-flow.model';
import { SNACKBAROUTCOME, SNACKBARTYPE } from '../models/snackbar.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public auth: Auth;
  private provider: AuthProvider;
  // public userSignal: WritableSignal<User | null> = signal(null);
  public loggedUserSignal: WritableSignal<LoggedUser | null> = signal(null);
  public loggedUser: LoggedUser | null = null;

  constructor(private router: Router, private userService: UserService, private ngZone: NgZone, private snackbarService: SnackbarService) {
    effect(() => {
      this.loggedUser = this.loggedUserSignal();
      // console.log(this.loggedUser);
    });

    this.auth = getAuth();
    this.provider = new GoogleAuthProvider();

    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        // console.log('User is signed in!');
        // console.log('User: ', user);

        try {
          let userData: UserData = await this.userService.getUserDataById(user.uid);
          userData.lastLogin = Timestamp.fromDate(new Date(Date.now()));
          this.userService.setUserDataById(user.uid, userData);
          this.loggedUserSignal.set(this.userService.parseUserData(user.uid, user, userData));
        } catch {
          let data: UserData = {
            userLevel: USERLEVEL.User,
            lastLogin: Timestamp.fromDate(new Date(Date.now())),
            apps: [APPFLOW.Default],
            lastApp: APPFLOW.Default
          }

          if (!user.isAnonymous) this.userService.setUserDataById(user.uid, data);
          this.loggedUserSignal.set(this.userService.parseUserData(user.uid, user, data));
        }
        this.ngZone.run(() => this.router.navigate(['/segnalazioni']));
      } else {
        this.loggedUserSignal.set(null);
        this.logInAnonymously();
      }
    });
  }

  public logInAnonymously(): void {
    signInAnonymously(this.auth)
      .then(() => {
        console.log('You\'re logged in anonymously');
      })
      .catch(error => {
        const errorCode = error.code;
        const errorMsg = error.message;

        console.log(errorCode);
        console.log(errorMsg);
      });
  }

  public logInWithEmailAndPassword(email: string, password: string): void {
    signInWithEmailAndPassword(this.auth, email, password)
      .then(userCredential => {
        console.log(`You\'re logged in with email and password`);
        this.ngZone.run(() => this.router.navigate(['/segnalazioni']));
        // console.log('User credentials:', userCredential);
      })
      .catch(error => {
        const errorCode = error.code;
        const errorMsg = error.message;

        console.log(errorCode);
        console.log(errorMsg);
        this.snackbarService.createSnackbar(this.translateErrorMessage(errorCode), SNACKBARTYPE.Closable, SNACKBAROUTCOME.Error);
      })
  }

  public signInWithGoogle(): void {
    signInWithPopup(this.auth, this.provider)
      .then(async result => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        const user = result.user;
        console.log(`You\'re logged in with Google account`);
        this.ngZone.run(() => this.router.navigate(['/segnalazioni']));
      })
      .catch(error => {
        const errorCode = error.code;
        const errorMsg = error.message;

        console.log(errorCode);
        console.log(errorMsg);
        this.snackbarService.createSnackbar(this.translateErrorMessage(errorCode), SNACKBARTYPE.Closable, SNACKBAROUTCOME.Error);
        const credential = GoogleAuthProvider.credentialFromError(error);
      })
  }

  public translateErrorMessage(error: string): string {
    let msg: string;

    switch (error) {
      case 'auth/invalid-email':
        msg = 'Email non trovata.'
        break;

      case 'auth/user-not-found':
        msg = 'Utente non trovato.'
        break;

      case 'auth/wrong-password':
        msg = 'Combinazione password/email errata.'
        break;

      default:
        msg = 'Errore. Riprovare.'
        break;
    }
    return msg;
  }
}
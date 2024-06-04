import { Injectable, WritableSignal, effect, signal, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, getAuth, signInAnonymously, onAuthStateChanged, User, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, AuthProvider } from 'firebase/auth';
import { LoggedUser } from '../models/user.model';
import { SnackbarService } from '../observables/snackbar.service';
import { SNACKBAROUTCOME, SNACKBARTYPE } from '../models/snackbar.model';
import { VERTICAL } from '../models/vertical.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public auth: Auth;
  private provider: AuthProvider;
  
  public user: User | null = null;
  public userSignal: WritableSignal<User | null> = signal(null);

  public loggedUserSignal: WritableSignal<LoggedUser | null> = signal(null);
  public loggedUser: LoggedUser | null = null;

  public currentAppSignal: WritableSignal<VERTICAL | null> = signal(null);
  public currentApp: VERTICAL | null = null;

  constructor(private router: Router, private ngZone: NgZone, private snackbarService: SnackbarService) {
    effect(() => {
      this.loggedUser = this.loggedUserSignal();
      // console.log(this.loggedUser);
    });

    effect(() => {
      this.user = this.userSignal();
      // console.log(this.loggedUser);
    });

    effect(() => this.currentApp = this.currentAppSignal());

    this.auth = getAuth();
    this.provider = new GoogleAuthProvider();

    onAuthStateChanged(this.auth, async (user: User | null) => {
      if (user) {        
        this.userSignal.set(user);      
      } else {        
        this.userSignal.set(user);
        this.logInAnonymously();
      }
      this.ngZone.run(() => this.router.navigate(['/segnalazioni']));
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
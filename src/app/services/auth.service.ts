import { Injectable, WritableSignal, effect, signal, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, getAuth, signInAnonymously, onAuthStateChanged, User, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, AuthProvider } from 'firebase/auth';
import { UserService } from './user.service';
import { LoggedUser, USERLEVEL, UserData } from '../models/user.model';
import { Timestamp } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public auth: Auth;
  private provider: AuthProvider;
  // public userSignal: WritableSignal<User | null> = signal(null);
  public loggedUserSignal: WritableSignal<LoggedUser | null> = signal(null);
  public loggedUser: LoggedUser | null = null;

  constructor(private router: Router, private userService: UserService, private ngZone: NgZone) {
    effect(() => {
      this.loggedUser = this.loggedUserSignal();
      console.log(this.loggedUser);
    });

    this.auth = getAuth();
    this.provider = new GoogleAuthProvider();

    // signInAnonymously(this.auth)
    //   .then(() => {
    //     console.log('You\'re logged in anonymously!');
    //   })
    //   .catch(error => {
    //     const errorCode = error.code;
    //     const errorMsg = error.message;

    //     console.log(errorCode);
    //     console.log(errorMsg);
    //   });

    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        // console.log('User is signed in!');
        // console.log('User: ', user);

        try {
          let userData: UserData = await this.userService.getUserById(user.uid);
          userData.lastLogin = Timestamp.fromDate(new Date(Date.now()));
          this.userService.setUserById(user.uid, userData);
          this.loggedUserSignal.set(this.userService.parseUserData(user, userData));
        } catch {
          let data: UserData = {
            userLevel: USERLEVEL.Admin,
            lastLogin: Timestamp.fromDate(new Date(Date.now()))
          }

          this.userService.setUserById(user.uid, data);
          this.loggedUserSignal.set(this.userService.parseUserData(user, data));
        }

        this.ngZone.run(() => this.router.navigate(['/segnalazioni']));
      } else {
        this.loggedUserSignal.set(null);
        // console.log('User is signed out!');
      }
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

        const credential = GoogleAuthProvider.credentialFromError(error);
      })
  }  
}
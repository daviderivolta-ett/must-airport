import { Injectable, WritableSignal, effect, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, getAuth, signInAnonymously, onAuthStateChanged, User, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, AuthProvider } from 'firebase/auth';
import { UserService } from './user.service';
import { LoggedUser, USERLEVEL, UserData } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public auth: Auth;
  private provider: AuthProvider;
  // public userSignal: WritableSignal<User | null> = signal(null);
  public loggedUserSignal: WritableSignal<LoggedUser | null> = signal(null);
  public loggedUser: LoggedUser | null = null;

  constructor(private router: Router, private userService: UserService) {
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
        // this.userSignal.set(this.auth.currentUser);
        // console.log('User is signed in!');
        console.log('User: ', user);
        let userData: UserData = await this.userService.getUserById(user.uid);
        this.loggedUserSignal.set(this.userService.parseUserData(user, userData));
      } else {
        this.loggedUserSignal.set(null);
        // console.log('User is signed out!');
      }
    });
  }

  public logInWithEmailAndPassword(email: string, password: string): void {
    signInWithEmailAndPassword(this.auth, email, password)
      .then(userCredential => {
        // this.userSignal.set(userCredential.user);
        console.log(`You\'re logged in with email and password`);
        // console.log('User credentials:', userCredential);
        this.router.navigate(['/segnalazioni']);
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
        // console.log(user);
        try {
          let userData: UserData = await this.userService.getUserById(user.uid);
          this.loggedUserSignal.set(this.userService.parseUserData(user, userData));
          this.router.navigate(['/segnalazioni']);
        } catch {
          let data = { userLevel: USERLEVEL.Admin }
          this.userService.createUserWithGoogleAccountById(user.uid, data);
          let userData: UserData = await this.userService.getUserById(user.uid);
          this.loggedUserSignal.set(this.userService.parseUserData(user, userData));
          this.router.navigate(['/segnalazioni']);
        }
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

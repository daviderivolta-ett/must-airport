import { Injectable } from '@angular/core';
import { LoggedUser, UserData } from '../models/user.model';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { CodesService } from './codes.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private db: Firestore) { }

  public async getUserDataById(id: string): Promise<UserData> {
    const q = doc(this.db, 'demoUsers', id);
    const snapshot = await getDoc(q);
    if (snapshot.exists()) {
      return snapshot.data() as UserData;
    } else {
      throw new Error('Utente non trovato');
    }
  }

  public async setUserDataById(id: string, data: UserData): Promise<void> {
    const ref = doc(this.db, 'demoUsers', id);
    await setDoc(ref, data);
  }

  public parseUserData(id: string, user: User, userData: UserData): LoggedUser {
    let u = LoggedUser.createEmpty();
  
    u.level = userData.userLevel;
    if (userData.lastLogin) u.lastLogin = userData.lastLogin.toDate();
    u.apps = [...userData.apps];
    // u.apps = this.codesService.getAppsByUserId(id);
    u.lastApp = userData.lastApp;
    user.displayName ? u.displayName = user.displayName : u.displayName = user.email;
    if (user.photoURL) u.picUrl = user.photoURL;
    u.email = user.email;
    u.id = id;
    console.log(u);    
    return u;
  }

  public checkIfUserIsAlreadyAbilitated(user: LoggedUser, app: string): boolean {
    return user.apps.some(item => item === app);
  }
}
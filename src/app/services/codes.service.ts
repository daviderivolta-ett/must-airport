import { Injectable, WritableSignal, effect, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { DocumentData, QuerySnapshot, Timestamp, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { Code, CodeDb } from '../models/code.model';
import { APPFLOW } from '../models/app-flow.model';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { LoggedUser, UserData } from '../models/user.model';
import { APPTYPE } from '../models/app-type.mode';

export interface CreateCodeFormData {
  code: string;
  app: APPFLOW;
  type: APPTYPE;
}

export interface UseCodeFormData {
  code: string;
}

@Injectable({
  providedIn: 'root'
})
export class CodesService {
  public codes: Code[] = [];
  public codesSignal: WritableSignal<Code[]> = signal([]);

  constructor(private db: Firestore, private authService: AuthService, private userService: UserService) {
    effect(() => this.codes = this.codesSignal());
  }

  public async setCodeById(id: string, data: CodeDb): Promise<void> {
    const ref = doc(this.db, 'codes', id);
    await setDoc(ref, data);
  }

  public async getAllCodes(): Promise<void> {
    const q = query(collection(this.db, 'codes'), orderBy('creationDate', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      let codesDb: Code[] = [];
      querySnapshot.forEach(doc => {
        codesDb.push(this.parseCodeDb(doc.data() as CodeDb))
      });
      this.codesSignal.set(codesDb);
    },
      (error: Error) => console.log(error)
    );
  }

  public async getCodeByCode(code: string): Promise<CodeDb> {
    const q = doc(this.db, 'codes', code);
    const snapshot = await getDoc(q);
    if (snapshot.exists()) {
      return snapshot.data() as CodeDb;
    } else {
      throw new Error('Codice non trovato.');
    }
  }

  public parseCodeDb(codeDb: CodeDb): Code {
    let c: Code = Code.createEmpty();

    c.code = codeDb.code;
    c.isValid = codeDb.isValid;

    switch (codeDb.vertId) {
      case 'default':
        c.vertId = APPFLOW.Default;
        break;
      case 'airport':
        c.vertId = APPFLOW.Airport
        break;
      default:
        c.vertId = APPFLOW.Default;
        break;
    }

    codeDb.usedOn ? c.usedOn = codeDb.usedOn.toDate() : null;
    codeDb.userId ? c.userId = codeDb.userId : null;
    codeDb.userEmail ? c.userEmail = codeDb.userEmail : null;

    return c;
  }

  public parseCode(code: Code): CodeDb {
    let c: CodeDb = {
      code: code.code,
      creationDate: Timestamp.fromDate(code.creationDate),
      isValid: code.isValid,
      vertId: code.vertId,
      appType: code.appType,
      usedOn: Timestamp.now(),
      userId: code.userId,
      userEmail: code.userEmail
    }

    code.usedOn ? c.usedOn = Timestamp.fromDate(code.usedOn) : null;

    return c;
  }

  public parseCreateCodeFormData(formData: CreateCodeFormData): any {
    let code = {
      code: formData.code,
      creationDate: Timestamp.now(),
      isValid: true,
      vertId: formData.app,
      appType: formData.type,
      usedOn: null,
      userId: null,
      userEmail: null
    }

    return code;
  }

  public checkIfCodeIsValid(formCode: string): boolean {
    let found: Code | undefined = this.codes.find(item => item.code === formCode);
    return found && found.isValid === true ? true : false;
  }

  public async consumeCode(code: string): Promise<void> {
    const loggedUser: LoggedUser | null = this.authService.loggedUser;
    if (!loggedUser) return;

    const isCodeValid = this.checkIfCodeIsValid(code);
    if (!isCodeValid) return;

    let codeDb: CodeDb = await this.getCodeByCode(code);
    codeDb.usedOn = Timestamp.now();
    codeDb.userId = loggedUser.id;
    codeDb.isValid = false;
    codeDb.userEmail = loggedUser.email;

    const isUserAlreadyAbilitated = this.userService.checkIfUserIsAlreadyAbilitated(loggedUser, codeDb.vertId);
    if (isUserAlreadyAbilitated) return;

    const codeObj: Code = this.parseCodeDb(codeDb);
    loggedUser.apps.push(codeObj.vertId);
    loggedUser.lastApp = codeObj.vertId;

    // console.log(codeDb);
    // console.log(loggedUser);

    let userData: UserData = {
      userLevel: loggedUser.level,
      lastLogin: Timestamp.fromDate(loggedUser.lastLogin),
      apps: loggedUser.apps,
      lastApp: loggedUser.lastApp
    }

    // console.log(userData);
    this.setCodeById(codeDb.code, codeDb);
    await this.userService.setUserDataById(loggedUser.id, userData);
  }
}
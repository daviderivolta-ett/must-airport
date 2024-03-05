import { Injectable, WritableSignal, effect, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { DocumentData, QuerySnapshot, Timestamp, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { Code, CodeDb } from '../models/code.model';
import { APPFLOW } from '../models/app-flow.model';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { LoggedUser, USERLEVEL, UserData } from '../models/user.model';
import { APPTYPE } from '../models/app-type.mode';
import { SnackbarService } from '../observables/snackbar.service';
import { SNACKBAROUTCOME, SNACKBARTYPE } from '../models/snackbar.model';

export interface CreateCodeFormData {
  code: string;
  app: APPFLOW;
  type: APPTYPE;
}

export interface UseCodeFormData {
  code: string;
}

export interface CodesFiltersFormData {
  appType: string,
  isValid: string,
  vertId: string;
}

export interface ParsedCodesFiltersFormData {
  appType: APPTYPE | string,
  isValid: boolean | string,
  vertId: APPFLOW | string
}

@Injectable({
  providedIn: 'root'
})
export class CodesService {
  public codes: Code[] = [];
  public codesSignal: WritableSignal<Code[]> = signal([]);

  public filteredCodes: Code[] = [];
  public filteredCodesSignal: WritableSignal<Code[]> = signal([]);

  constructor(private db: Firestore, private authService: AuthService, private userService: UserService, private snackbarService: SnackbarService) {
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
    c.creationDate = codeDb.creationDate.toDate();

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

    switch (codeDb.appType) {
      case 'mobile':
        c.appType = APPTYPE.Mobile;
        break;
      default:
        c.appType = APPTYPE.Web;
        break;
    }

    codeDb.associatedOn ? c.usedOn = codeDb.associatedOn.toDate() : null;
    codeDb.user ? c.userId = codeDb.user : null;
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
      associatedOn: Timestamp.now(),
      user: code.userId,
      userEmail: code.userEmail
    }

    code.usedOn ? c.associatedOn = Timestamp.fromDate(code.usedOn) : null;

    return c;
  }

  public parseCreateCodeFormData(formData: CreateCodeFormData): any {
    let code = {
      code: formData.code,
      creationDate: Timestamp.now(),
      isValid: true,
      vertId: formData.app,
      appType: formData.type,
      associatedOn: null,
      user: null,
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
    if (!isCodeValid) {
      this.snackbarService.createSnackbar('Il codice inserito non è valido.', SNACKBARTYPE.Closable, SNACKBAROUTCOME.Error);
      return;
    }

    let codeDb: CodeDb = await this.getCodeByCode(code);
    codeDb.associatedOn = Timestamp.now();
    codeDb.user = loggedUser.id;
    codeDb.isValid = false;
    codeDb.userEmail = loggedUser.email;

    if (codeDb.appType !== APPTYPE.Web) {
      this.snackbarService.createSnackbar('Il codice non è valido per la versione web.', SNACKBARTYPE.Closable, SNACKBAROUTCOME.Error);
      return;
    }

    const isUserAlreadyAbilitated = this.userService.checkIfUserIsAlreadyAbilitated(loggedUser, codeDb.vertId);
    if (isUserAlreadyAbilitated) {
      this.snackbarService.createSnackbar(`Sei già abilitato per l\'app ${codeDb.vertId}.`, SNACKBARTYPE.Closable, SNACKBAROUTCOME.Error);
      return;
    }

    const codeObj: Code = this.parseCodeDb(codeDb);
    loggedUser.apps.push(codeObj.vertId);
    loggedUser.lastApp = codeObj.vertId;

    // console.log(codeDb);
    // console.log(loggedUser);

    let userData: UserData = {
      userLevel: USERLEVEL.Admin,
      lastLogin: Timestamp.fromDate(loggedUser.lastLogin),
      apps: loggedUser.apps,
      lastApp: loggedUser.lastApp
    }

    // console.log(userData);
    this.setCodeById(codeDb.code, codeDb);
    await this.userService.setUserDataById(loggedUser.id, userData);
  }

  public parseCodesFiltersFormData(formData: CodesFiltersFormData): ParsedCodesFiltersFormData {
    let data: ParsedCodesFiltersFormData = {
      appType: 'all',
      vertId: 'all',
      isValid: 'all'
    }

    switch (formData.appType) {
      case 'mobile':
        data.appType = APPTYPE.Mobile;
        break;
      case 'web':
        data.appType = APPTYPE.Web;
        break;
      default:
        data.appType = 'all';
        break;
    }

    switch (formData.vertId) {
      case 'airport':
        data.vertId = APPFLOW.Airport;
        break;
      case 'default':
        data.vertId = APPFLOW.Default;
        break;
      default:
        data.vertId = 'all';
        break;
    }

    switch (formData.isValid) {
      case 'true':
        data.isValid = true;
        break;
      case 'false':
        data.isValid = false;
        break;
      default:
        data.isValid = 'all';
        break;
    }

    return data;
  }

  public filterCodes(filters: ParsedCodesFiltersFormData) {
    let filteredCodes: Code[] = this.codes.slice();
    for (const key in filters) {
      if (key === 'isValid') {
        if (filters[key] !== 'all') filteredCodes = filteredCodes.filter(code => code.isValid === filters[key]);
      }

      if (key === 'appType') {
        if (filters[key] !== 'all') filteredCodes = filteredCodes.filter(code => code.appType === filters[key]);
      }

      if (key === 'vertId') {
        if (filters[key] !== 'all') filteredCodes = filteredCodes.filter(code => code.vertId === filters[key]);
      }
    }
    this.filteredCodesSignal.set(filteredCodes);
  }

  public checkIfUserIsAuthorized(user: LoggedUser, app: APPFLOW): boolean {
    let codesUsedByUser: Code[] = this.codes.filter(code => code.userId === user.id);
    let isAuthorized: boolean = codesUsedByUser.some(code => code.vertId === app);
    console.log(isAuthorized);
    return isAuthorized;
  }
}
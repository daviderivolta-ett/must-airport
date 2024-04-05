import { Injectable, Signal, WritableSignal, computed, effect, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { DocumentData, QuerySnapshot, Timestamp, Unsubscribe, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { Code, CodeDb } from '../models/code.model';
import { VERTICAL } from '../models/app-flow.model';
import { LoggedUser } from '../models/user.model';
import { APPTYPE } from '../models/app-type.mode';

export interface CreateCodeFormData {
  code: string;
  app: VERTICAL;
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
  vertId: VERTICAL | string
}

@Injectable({
  providedIn: 'root'
})
export class CodesService {
  public codes: Code[] = [];
  public codesSignal: Signal<Code[]> = computed(() => {
    const webCodes = this.webCodesSignal();
    const mobileCodes = this.mobileCodesSignal();

    const codes = [...webCodes, ...mobileCodes];
    return codes;
  })

  public filteredCodes: Code[] = [];
  public filteredCodesSignal: WritableSignal<Code[]> = signal([]);

  public webCodes: Code[] = [];
  public webCodesSignal: WritableSignal<Code[]> = signal([]);

  public mobileCodes: Code[] = [];
  public mobileCodesSignal: WritableSignal<Code[]> = signal([]);

  constructor(private db: Firestore) {
    effect(() => this.codes = this.codesSignal());
  }

  public async setCodeById(appType: APPTYPE, id: string, data: CodeDb): Promise<void> {
    const ref = appType === APPTYPE.Web ? doc(this.db, 'web_codes', id) : doc(this.db, 'mobile_codes', id);
    try {
      await setDoc(ref, data, { merge: true });
    } catch (error) {
      throw new Error('Errore nell\'aggiornamento del codice.');
    }
  }

  public async getAllCodes(): Promise<void> {
    await this.getAllWebCodes();
    await this.getAllMobileCodes();
  }

  public async getAllWebCodes(): Promise<void> {
    const q = query(collection(this.db, 'web_codes'), orderBy('creationDate', 'desc'));
    const unsubscribe: Unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      let codesDb: Code[] = [];
      querySnapshot.forEach(doc => {
        codesDb.push(this.parseCodeDb(doc.data() as CodeDb, APPTYPE.Web))
      });
      this.webCodesSignal.set(codesDb);
    },
      (error: Error) => console.log(error)
    );
  }

  public async getAllMobileCodes(): Promise<void> {
    const q = query(collection(this.db, 'mobile_codes'), orderBy('creationDate', 'desc'));
    const unsubscribe: Unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      let codesDb: Code[] = [];
      querySnapshot.forEach(doc => {
        codesDb.push(this.parseCodeDb(doc.data() as CodeDb, APPTYPE.Mobile))
      });
      this.mobileCodesSignal.set(codesDb);
    },
      (error: Error) => console.log(error)
    );
  }

  public async getCodeByCode(code: string): Promise<CodeDb> {
    const q = doc(this.db, 'web_codes', code);
    const snapshot = await getDoc(q);
    if (snapshot.exists()) {
      return snapshot.data() as CodeDb;
    } else {
      throw new Error('Codice non trovato.');
    }
  }

  public parseCodeDb(codeDb: CodeDb, appType: APPTYPE = APPTYPE.Web): Code {
    let c: Code = Code.createEmpty();

    c.code = codeDb.code;
    c.isValid = codeDb.isValid;
    c.creationDate = codeDb.creationDate.toDate();

    switch (codeDb.vertId) {
      case 'default':
        c.vertId = VERTICAL.Default;
        break;
      case 'airport':
        c.vertId = VERTICAL.Airport
        break;
      case 'dsh2030':
        c.vertId = VERTICAL.DSH2030;
        break;
      default:
        c.vertId = VERTICAL.Default;
        break;
    }

    switch (appType) {
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
      // appType: code.appType,
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
      isValid: false,
      vertId: formData.app.toLowerCase(),
      // appType: formData.type,
      associatedOn: null,
      user: null,
      userEmail: null
    }

    return code;
  }

  public checkIfCodeExists(formCode: string): Code | null {
    let found: Code | undefined = this.codes.find(item => item.code === formCode);
    return found || null;
  }

  public checkIfCodeIsWebValid(code: Code): boolean {
    return code.appType === APPTYPE.Web;
  }

  public checkIfCodesIsAlreadyAssociated(code: Code): boolean {
    return code.usedOn !== null;
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
        data.vertId = VERTICAL.Airport;
        break;
      case 'default':
        data.vertId = VERTICAL.Default;
        break;
      case 'dsh2030':
        data.vertId = VERTICAL.DSH2030;
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

  public checkIfUserIsAuthorized(user: LoggedUser, app: VERTICAL): boolean {
    let codesUsedByUser: Code[] = this.codes.filter(code => code.userId === user.id);
    let code: Code | undefined = codesUsedByUser.find(code => code.vertId === app);
    return (code && code.isValid === true) ? true : false;
  }

  public getAppsByUserId(id: string): VERTICAL[] {
    let filteredCodes: Code[] = this.codes.filter(code => code.userId === id && code.isValid === true);
    let apps: VERTICAL[] = filteredCodes.map(code => code.vertId);
    return apps;
  }
}
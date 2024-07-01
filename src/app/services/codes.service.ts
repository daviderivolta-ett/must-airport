import { Injectable, Signal, WritableSignal, computed, effect, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { DocumentData, DocumentReference, Query, QueryDocumentSnapshot, QuerySnapshot, Unsubscribe, collection, doc, getDoc, onSnapshot, query, setDoc } from 'firebase/firestore';
import { VERTICAL } from '../models/vertical.model';
import { LoggedUser } from '../models/user.model';
import { APPTYPE } from '../models/app-type.mode';
import { AuthCode, authCodeConverter } from '../models/auth-code.model';

@Injectable({
  providedIn: 'root'
})
export class CodesService {
  public authCodes: AuthCode[] = [];
  public filteredAuthCodesSignal: WritableSignal<AuthCode[]> = signal([]);
  public webAuthCodesSignal: WritableSignal<AuthCode[]> = signal([]);
  public mobileAuthCodesSignal: WritableSignal<AuthCode[]> = signal([]);

  public authCodesSignal: Signal<AuthCode[]> = computed(() => {
    const webAuthCodes: AuthCode[] = this.webAuthCodesSignal();
    const mobileAuthCodes: AuthCode[] = this.mobileAuthCodesSignal();
    const authCodes: AuthCode[] = [...webAuthCodes, ...mobileAuthCodes];
    return authCodes;
  });

  constructor(private db: Firestore) {
    effect(() => this.authCodes = this.authCodesSignal());
  }

  public async setAuthCodeById(id: string, data: AuthCode, appType: APPTYPE): Promise<void> {    
    const ref: DocumentReference<DocumentData> = doc(this.db, appType === APPTYPE.Mobile ? 'mobile_codes' : 'web_codes', id).withConverter(authCodeConverter);    
    try {
      await setDoc(ref, data, { merge: true });  
    } catch (error: any) {
      console.log(error);      
      throw new Error('Errore nell\'aggiornamento del codice.');
    }
  }

  public async getAllCodes(): Promise<void> {
    await this.getAllAuthCodes(APPTYPE.Web);
    await this.getAllAuthCodes(APPTYPE.Mobile);
  }

  public async getAllAuthCodes(appType: APPTYPE): Promise<void> {
    const q: Query = query(collection(this.db, appType === APPTYPE.Mobile ? 'mobile_codes' : 'web_codes')).withConverter(authCodeConverter);
    const unsubscribe: Unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const authCodes: AuthCode[] = [];
      querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
        const authCode: AuthCode = doc.data() as AuthCode;
        appType === APPTYPE.Mobile ? authCode.appType = APPTYPE.Mobile : authCode.appType = APPTYPE.Web;
        authCodes.push(authCode);
        appType === APPTYPE.Mobile ? this.mobileAuthCodesSignal.set(authCodes) : this.webAuthCodesSignal.set(authCodes);
      });
    },
      (error: Error) => console.log(error)
    );
  }

  public async getCodeByCode(code: string): Promise<AuthCode> {
    const q = doc(this.db, 'web_codes', code);
    const snapshot = await getDoc(q);
    if (snapshot.exists()) {
      return snapshot.data() as AuthCode;
    } else {
      throw new Error('Codice non trovato.');
    }
  }

  public checkIfCodeExists(formCode: string): AuthCode | null {
    let found: AuthCode | undefined = this.authCodes.find((item: AuthCode) => item.code === formCode);
    return found || null;
  }

  public checkIfCodeIsWebValid(code: AuthCode): boolean {
    return code.appType === APPTYPE.Web;
  }

  public checkIfCodesIsAlreadyAssociated(code: AuthCode): boolean {
    return code.associatedOn !== null;
  }

  public filterAuthCodes(filters: any): void {
    let filteredCodes: AuthCode[] = [...this.authCodes];

    for (const key in filters) {
      if (Object.prototype.hasOwnProperty.call(filters, key)) {
        if (key === 'isValid') {
          if (filters[key] !== 'all') {
            switch (filters[key]) {
              case 'true':
                filteredCodes = filteredCodes.filter((code: AuthCode) => code.associatedOn);
                break;
              default:
                filteredCodes = filteredCodes.filter((code: AuthCode) => !code.associatedOn);
                break;
            }
          }
        }
        if (key === 'appType') {
          if (filters[key] !== 'all') filteredCodes = filteredCodes.filter((code: AuthCode) => code.appType === filters[key]);
        }
        if (key === 'vertId') {
          if (filters[key] !== 'all') filteredCodes = filteredCodes.filter((code: AuthCode) => code.vertId === filters[key]);
        }
      }
    }

    this.filteredAuthCodesSignal.set(filteredCodes);
  }

  public checkIfUserIsAuthorized(user: LoggedUser, app: VERTICAL): boolean {
    let codesUsedByUser: AuthCode[] = this.authCodes.filter((code: AuthCode) => code.user === user.id);
    let code: AuthCode | undefined = codesUsedByUser.find(code => code.vertId === app);
    return (code && code.isValid === true) ? true : false;
  }

  public getAppsByUserId(id: string): VERTICAL[] {
    let filteredCodes: AuthCode[] = this.authCodes.filter((code: AuthCode) => code.user === id && code.isValid === true);
    let apps: VERTICAL[] = filteredCodes.map(code => code.vertId);
    return apps;
  }
}
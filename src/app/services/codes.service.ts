import { Injectable, WritableSignal, effect, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { DocumentData, QuerySnapshot, Timestamp, collection, doc, getDocs, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { Code, CodeDb } from '../models/code.model';
import { APPFLOW } from '../models/app-flow.model';

export interface CreateCodeFormData {
  code: string;
  app: APPFLOW;
}

@Injectable({
  providedIn: 'root'
})
export class CodesService {
  public codes: Code[] = [];
  public codesSignal: WritableSignal<Code[]> = signal([]);

  constructor(private db: Firestore) { }

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

    return c;
  }

  public parseCode(code: Code): CodeDb {
    let c: CodeDb = {
      code: code.code,
      creationDate: Timestamp.fromDate(code.creationDate),
      isValid: code.isValid,
      vertId: code.vertId,
      usedOn: Timestamp.now(),
      userId: code.userId
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
      usedOn: null,
      userId: null
    }

    return code;
  }
}
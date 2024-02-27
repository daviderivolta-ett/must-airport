import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Timestamp, doc, setDoc } from 'firebase/firestore';
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

  constructor(private db: Firestore) { }

  public async setCodeById(id: string, data: CodeDb): Promise<void> {
    const ref = doc(this.db, 'codes', id);
    await setDoc(ref, data);
  }

  public parseCodeDb(codeDb: CodeDb): Code {
    let c: Code = Code.createEmpty();

    c.code = codeDb.code;
    c.isValid = codeDb.isValid;

    switch (codeDb.app) {
      case 'default':
        c.app = APPFLOW.Default;
        break;
      case 'airport':
        c.app = APPFLOW.Airport
        break;
      default:
        c.app = APPFLOW.Default;
        break;
    }

    codeDb.usedOn ? c.usedOn = codeDb.usedOn.toDate() : null;
    codeDb.userId ? c.userId = codeDb.userId : null;

    return c;
  }

  public parseCode(code: Code): CodeDb {
    let c: CodeDb = {
      code: code.code,
      isValid: code.isValid,
      app: code.app,
      usedOn: Timestamp.now(),
      userId: code.userId
    }

    code.usedOn ? c.usedOn = Timestamp.fromDate(code.usedOn) : null;

    return c;
  }

  public parseCreateCodeFormData(formData: CreateCodeFormData): any {
    let code = {
      code: formData.code,
      isValid: false,
      app: formData.app,
      usedOn: null,
      userId: null
    }

    return code;
  }
}
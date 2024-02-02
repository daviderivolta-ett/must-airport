import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { DocumentData, QuerySnapshot, collection, getDocs, query } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class FailuresService {

  constructor(private db: Firestore) { }

  public async getAllFailures(): Promise<QuerySnapshot> {
    const q = query(collection(this.db, 'reportParents'));
    const snapshot = await getDocs(q);
    return snapshot;
  }
}

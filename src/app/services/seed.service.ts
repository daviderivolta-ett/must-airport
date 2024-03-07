import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { doc, setDoc } from 'firebase/firestore';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SeedService {

  constructor(private db: Firestore, private http: HttpClient) { }

  public async setFailureTag(data: any): Promise<void> {
    const ref = doc(this.db, 'tagsTechElement', data.DOCID);
    await setDoc(ref, data, { merge: true });
  }

  public getFailureTags(): Observable<any> {
    return this.http.get<any>('./assets/json/verticalTags.json').pipe(
      map(res => {
        console.log(res);
        res.forEach((d: any) => this.setFailureTag(d));
      })
    )
  }

}
import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { StorageError, StorageReference, UploadResult, UploadTaskSnapshot, deleteObject, getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { VERTICAL } from '../models/vertical.model';
import { CollectionReference, DocumentData, DocumentReference, DocumentSnapshot, Query, QuerySnapshot, addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { ReportFile, reportFileConverter } from '../models/report-file.model';

@Injectable({
  providedIn: 'root'
})
export class ReportFileService {

  constructor(private db: Firestore, private storage: Storage) { }

  public async uploadFile(file: File, verticalId: VERTICAL, fileName: string, onProgress: (snapshot: UploadTaskSnapshot) => void): Promise<string> {
    const storageRef: StorageReference = ref(this.storage, `documents/${verticalId}/${fileName}`);

    // try {
    //   return await uploadBytes(storageRef, file)
    //     .then((result: UploadResult) => getDownloadURL(result.ref).then(url => url))
    // } catch (error) {
    //   if (error instanceof StorageError) {
    //     console.error('Firebase storage error:', error.code, error.message);
    //   } else {
    //     console.error('Error uploading file:', error);
    //   }
    //   throw error;
    // }

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on('state_changed', (snapshot: UploadTaskSnapshot) => {
        onProgress(snapshot);

        switch (snapshot.state) {
          case 'paused':
            break;
          case 'running':
            break;
        }

      },
        (error) => {
          onProgress(uploadTask.snapshot);
          if (error instanceof StorageError) {
            console.error('Firebase storage error', error);
          } else {
            console.error('Error uploading file', error);
          }
          reject(error);
        },
        () => {
          onProgress(uploadTask.snapshot);
          getDownloadURL(uploadTask.snapshot.ref)
            .then((url: string) => resolve(url))
            .catch((error: Error) => reject(error));
        }
      );
    });

  }

  public async deleteFile(verticalId: string, fileName: string): Promise<void> {
    const storageRef: StorageReference = ref(this.storage, `documents/${verticalId}/${fileName}`);
    deleteObject(storageRef)
      .catch((err) => console.error(err))
  }

  public async getFileUrl(verticalId: VERTICAL, fileName: string): Promise<string> {
    const storageRef: StorageReference = ref(this.storage, `documents/${verticalId}/${fileName}`);
    return getDownloadURL(storageRef).then((url: string) => url);
  }

  public async getAllReportFilesByReportId(id: string): Promise<ReportFile[]> {
    let reportFiles: ReportFile[] = [];
    const q: Query = query(collection(this.db, 'reportFiles'), where('parentId', '==', id)).withConverter(reportFileConverter);
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
    querySnapshot.forEach((doc) => {
      reportFiles.push(doc.data() as ReportFile);
    });
    return reportFiles;
  }

  public async getReportFileById(id: string): Promise<ReportFile | undefined> {
    const docRef: DocumentReference = doc(this.db, 'reportFiles', id).withConverter(reportFileConverter);
    const docSnap: DocumentSnapshot = await getDoc(docRef);

    if (docSnap.exists()) {
      const data: ReportFile = docSnap.data() as ReportFile;
      return data;
    } else {
      return undefined;
    }
  }

  public async setReportFile(data: ReportFile): Promise<string> {
    const ref: CollectionReference = collection(this.db, 'reportFiles').withConverter(reportFileConverter);
    const docRef: DocumentReference = await addDoc(ref, data);
    return docRef.id;
  }

  public async deleteReportFile(id: string) {
    const ref: DocumentReference<DocumentData> = doc(this.db, 'reportFiles', id);
    await deleteDoc(ref);
  }
}

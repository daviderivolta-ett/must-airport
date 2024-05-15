import { Injectable, WritableSignal, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { CollectionReference, DocumentData, Query, QuerySnapshot, addDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import { AdditionalLayer, AdditionalLayerDb, additionalLayerConverter } from '../models/additional-layer.model';
import { Storage } from '@angular/fire/storage';
import { StorageReference, getBlob, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { VERTICAL } from '../models/app-flow.model';

@Injectable({
  providedIn: 'root'
})
export class AdditionalLayersService {
  // public geoJson: any;
  public allLayersSignal: WritableSignal<AdditionalLayer[]> = signal([]);
  public currentLayersSignal: WritableSignal<AdditionalLayer[]> = signal([]);
  private _currentLayers: AdditionalLayer[] = [];

  constructor(private db: Firestore, private storage: Storage) { }

  public get currentLayers(): AdditionalLayer[] {
    return this._currentLayers;
  }

  public set currentLayers(currentLayers: AdditionalLayer[]) {
    this._currentLayers = currentLayers;
    this.currentLayersSignal.set(this.currentLayers);
  }

  public isValidGeoJSON(content: string): boolean {
    try {
      const geoJSON: any = JSON.parse(content);
      if (!geoJSON.type || (geoJSON.type !== 'Feature' && geoJSON.type !== 'FeatureCollection' && geoJSON.type !== 'Point' && geoJSON.type !== 'Geometry')) return false;
      return true;
    } catch (error) {
      return false;
    }
  }

  public async getAllAdditionalLayers(vertId: VERTICAL) {
    const ref = collection(this.db, 'additionalLayers').withConverter(additionalLayerConverter);
    if (!ref) return;
   
    const q: Query = query(ref as CollectionReference<AdditionalLayerDb>, where('vertId', '==', vertId));
  
    const unsubscribe = onSnapshot(q,
      async (querySnapshot: QuerySnapshot<DocumentData>) => {
        const promises: Promise<AdditionalLayer>[] = querySnapshot.docs.map(async doc => {
          const layerDb: AdditionalLayerDb = doc.data() as AdditionalLayerDb;
          const geoJSON = await this.getGeoJson(layerDb.fileName);
          return new AdditionalLayer(layerDb.name, layerDb.fileName, layerDb.vertId, layerDb.style, doc.id, geoJSON);
        });
  
        const layers: AdditionalLayer[] = await Promise.all(promises);
        this.allLayersSignal.set(layers);
      },
      (err: Error) => console.log(err)
    );
  }
  

  public async setAdditionalLayer(data: AdditionalLayerDb): Promise<void> {
    const ref = collection(this.db, 'additionalLayers').withConverter(additionalLayerConverter);
    await addDoc(ref, data)
    // .catch((error) => console.log('nu'));
  }

  public async uploadGeoJSON(file: File, fileName: string): Promise<string> {
    const storageRef = ref(this.storage, 'geoJSON/' + fileName);
    return uploadBytes(storageRef, file).then(async (snapshot) => {
      return await getDownloadURL(storageRef);
    });
  }

  public async readFile(file: File): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const reader: FileReader = new FileReader();

      reader.onload = (e: Event) => {
        const textDecoder = new TextDecoder('utf-8');
        const content = textDecoder.decode(reader.result as ArrayBuffer);

        try {
          const isValid: boolean = this.isValidGeoJSON(content);
          if (isValid) {
            console.log('Il file è un GeoJSON valido.');
          } else {
            console.log('Il file non è un GeoJSON valido.');
          }
          resolve(isValid);
        } catch (error) {
          console.error('Errore durante il parsing del JSON:', error);
          reject(error);
        }
      };

      reader.readAsArrayBuffer(file);
    });
  }

  private async getGeoJson(fileName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const storageRef: StorageReference = ref(this.storage, `geoJSON/${fileName}`);

      getBlob(storageRef).then(blob => {
        const fileReader: FileReader = new FileReader();

        fileReader.onload = (event: ProgressEvent<FileReader>) => {
          if (event.target && typeof event.target.result === 'string') {
            const content: string = event.target.result;
            const geoJSON: any = JSON.parse(content); 
            resolve(geoJSON);
          }
        }

        fileReader.onerror = (error) => {
          reject(error);
        };

        fileReader.readAsText(blob);
      })
        .catch((error: Error) => {
          reject(error);
        });
    });
  }

  public addAdditionalLayer(layer: AdditionalLayer): void {
    const layers: AdditionalLayer[] = [...this.currentLayers];
    layers.push(layer);
    this.currentLayers = [...layers];
  }

  public removeAdditionalLayer(layer: AdditionalLayer): void {
    const layers: AdditionalLayer[] = this.currentLayers.filter((l: AdditionalLayer) => {
      return l.id !== layer.id;
    });   
    this.currentLayers = [...layers];
  }
}
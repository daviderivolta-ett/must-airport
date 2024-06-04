import { Injectable, WritableSignal, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { CollectionReference, DocumentData, Query, QuerySnapshot, addDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import { AdditionalLayer, AdditionalLayerDb, AdditionalLayerStyle, additionalLayerConverter } from '../models/additional-layer.model';
import { Storage } from '@angular/fire/storage';
import { StorageReference, getBlob, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { VERTICAL } from '../models/vertical.model';

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
          const geoJSON = JSON.parse(await this.getGeoJson(layerDb.fileName));
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

  public async readFile(file: File | Blob): Promise<string | undefined> {
    return new Promise<string | undefined>((resolve, reject) => {
      const reader: FileReader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const textDecoder: TextDecoder = new TextDecoder('utf-8');
        const content: string = textDecoder.decode(reader.result as ArrayBuffer);
        resolve(content);
      }

      reader.onerror = (e: ProgressEvent<FileReader>) => {
        reject(new Error('Errore durante il parsing del JSON:'));
      }

      reader.readAsArrayBuffer(file);
    });
  }

  public getGeoJsonStyle(geoJSON: any): AdditionalLayerStyle {
    let style: AdditionalLayerStyle = { fillColor: '#3388ff', strokeColor: '#3388ff' };
    for (let i = 0; i < geoJSON.features.length; i++) {
      const feature: any = geoJSON.features[i];
      if (feature.properties.stroke && typeof feature.properties.stroke === 'string') style.strokeColor = feature.properties.stroke;
      if (feature.properties.fill && typeof feature.properties.fill === 'string') style.fillColor = feature.properties.fill;
      break;
    }
    return style;
  }

  private async getGeoJson(fileName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const storageRef: StorageReference = ref(this.storage, `geoJSON/${fileName}`);

      getBlob(storageRef).then(async blob => {
        const contentString: string | undefined = await this.readFile(blob);
        contentString ? resolve(contentString) : reject(new Error('Errore durante il parsing del JSON:'));
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
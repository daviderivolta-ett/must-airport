import { Injectable, WritableSignal, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { CollectionReference, Query, QueryDocumentSnapshot, QuerySnapshot, addDoc, collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { AdditionalLayer, AdditionalLayerStyle, additionalLayerConverter } from '../models/additional-layer.model';
import { Storage } from '@angular/fire/storage';
import { StorageReference, deleteObject, getBlob, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { VERTICAL } from '../models/vertical.model';
import { Unsubscribe } from 'firebase/auth';

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
    const ref: CollectionReference = collection(this.db, 'additionalLayers');
    const q: Query = query(ref, where('vertId', '==', vertId)).withConverter(additionalLayerConverter);

    const unsubscribe: Unsubscribe = onSnapshot(q, async (querySnapshot: QuerySnapshot) => {
      let layers: AdditionalLayer[] = [];
      const promises = querySnapshot.docs.map(async (doc: QueryDocumentSnapshot) => {
        const layer: AdditionalLayer = doc.data() as AdditionalLayer;
        const geoJson = JSON.parse(await this.getGeoJson(vertId, layer.fileName));
        layer.geoJson = geoJson;
        return layer;
      });

      layers = await Promise.all(promises);
      layers.sort((a: AdditionalLayer, b: AdditionalLayer) => a.name.localeCompare(b.name));

      this.allLayersSignal.set(layers);
    });
  }

  public async uploadAdditionalLayer(data: AdditionalLayer): Promise<void> {
    try {
      const ref: CollectionReference = collection(this.db, 'additionalLayers').withConverter(additionalLayerConverter);
      await addDoc(ref, data);
    } catch (error) {
      throw new Error('Errore nel caricamento del layer');
    }
  }

  public async deleteAdditionalLayer(id: string) {
    try {
      await deleteDoc(doc(this.db, 'additionalLayers', id));
    } catch (error) {
      throw new Error('Errore nella cancellazione del file');
    }
  }

  public async uploadGeoJSON(file: File, fileName: string, verticalId: VERTICAL): Promise<string> {
    try {
      const storageRef = ref(this.storage, `geoJSON/${verticalId}/${fileName}`);
      return uploadBytes(storageRef, file).then(async (snapshot) => {
        return await getDownloadURL(storageRef);
      });
    } catch (error) {
      throw new Error('Errore nel caricamento del layer');
    }
  }

  public async deleteGeoJSON(layer: AdditionalLayer) {
    const fileRef: StorageReference = ref(this.storage, `geoJSON/${layer.vertId}/${layer.fileName}`);
    deleteObject(fileRef)
      .then(() => {
        console.log('Layer cancellato correttamente');
      })
      .catch(() => {
        throw new Error('Errore nella cancellazione del file');
      })
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

  private async getGeoJson(verticalId: VERTICAL, fileName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const storageRef: StorageReference = ref(this.storage, `geoJSON/${verticalId}/${fileName}`);

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
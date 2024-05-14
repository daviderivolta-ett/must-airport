import { Injectable, WritableSignal, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { CollectionReference, DocumentData, DocumentSnapshot, Query, QuerySnapshot, addDoc, collection, getDocs, onSnapshot, query } from 'firebase/firestore';
import { AdditionalLayer, AdditionalLayerDb, additionalLayerConverter } from '../models/additional-layer.model';
import { Storage } from '@angular/fire/storage';
import { StorageReference, getBlob, getBytes, getDownloadURL, getStream, ref, uploadBytes } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class AdditionalLayersService {
  public geoJson: any;
  public layersSignal: WritableSignal<AdditionalLayer[]> = signal([]);

  constructor(private db: Firestore, private storage: Storage) { }

  public isValidGeoJSON(content: string): boolean {
    try {
      const geoJSON: any = JSON.parse(content);
      if (!geoJSON.type || (geoJSON.type !== 'Feature' && geoJSON.type !== 'FeatureCollection' && geoJSON.type !== 'Geometry')) return false;
      return true;
    } catch (error) {
      return false;
    }
  }

  public async getAllAdditionalLayers() {
    const ref = collection(this.db, 'additionalLayers').withConverter(additionalLayerConverter);
    if (!ref) return;
    const q: Query = query(ref as CollectionReference<AdditionalLayerDb>);
    const unsubscribe = onSnapshot(q,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const layers: AdditionalLayer[] = [];
        querySnapshot.forEach(doc => {
          const layerDb: AdditionalLayerDb = doc.data() as AdditionalLayerDb;
          const layer: AdditionalLayer = new AdditionalLayer(layerDb.name, layerDb.geoJsonUrl, layerDb.vertId, doc.id, null);
          this.getGeoJson(layer.geoJsonUrl);
          layers.push(layer);
        });
        this.layersSignal.set(layers);
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

  public readFile(file: File): void {
    const reader: FileReader = new FileReader();

    reader.onload = (e: Event) => {
      const textDecoder = new TextDecoder('utf-8');
      const content = textDecoder.decode(reader.result as ArrayBuffer);

      try {
        if (this.isValidGeoJSON(content)) {
          const parsedGeoJSON: any = JSON.parse(content);
          console.log('Il file è un GeoJSON valido.');
          this.geoJson = parsedGeoJSON;
        } else {
          console.log('Il file non è un GeoJSON valido.');
        }
      } catch (error) {
        console.error('Errore durante il parsing del JSON:', error);
      }
    }
    reader.readAsArrayBuffer(file);
  }

  private getGeoJson(url: string): void {
    const storageRef: StorageReference = ref(this.storage, url);
    // getBytes(storageRef).then(a => console.log(a));

    // getDownloadURL(storageRef)
    //   .then(url => {
    //       console.log(url);          
    //   })
  }
}

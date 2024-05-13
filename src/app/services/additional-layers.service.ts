import { Injectable, WritableSignal, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { CollectionReference, DocumentData, DocumentSnapshot, Query, QuerySnapshot, addDoc, collection, getDocs, onSnapshot, query } from 'firebase/firestore';
import { AdditionalLayer, additionalLayerConverter } from '../models/additional-layer.model';
import { Storage } from '@angular/fire/storage';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

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

  public async getAllGeoJSON() {
    const ref = collection(this.db, 'additionalLayers').withConverter(additionalLayerConverter);
    if (!ref) return;
    const q: Query = query(ref as CollectionReference<AdditionalLayer>);
    const unsubscribe = onSnapshot(q,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const layers: AdditionalLayer[] = [];
        querySnapshot.forEach(doc => {
          layers.push(doc.data() as AdditionalLayer);
        });
        this.layersSignal.set(layers);
      },
      (err: Error) => console.log(err)
    );
  }

  public async setAdditionalLayer(data: AdditionalLayer): Promise<void> {
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
}

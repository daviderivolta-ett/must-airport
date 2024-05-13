import { DocumentData, DocumentSnapshot, QuerySnapshot } from 'firebase/firestore';
import { VERTICAL } from './app-flow.model';

export class AdditionalLayer {
    name: string;
    geoJsonUrl: string;
    vertId: VERTICAL;

    constructor(name: string, geoJsonUrl: string, vertId: VERTICAL) {
        this.name = name;
        this.geoJsonUrl = geoJsonUrl;
        this.vertId = vertId;
    }
}

export const additionalLayerConverter = {
    toFirestore: (layer: AdditionalLayer) => {
        return {
            name: layer.name,
            geoJsonUrl: layer.geoJsonUrl,
            vertId: layer.vertId
        };
    },
    fromFirestore: (snapshot: DocumentSnapshot, options: any) => {
        const data = snapshot.data(options);
        if (!data) return;
        return new AdditionalLayer(data['name'], data['geoJsonUrl'], data['vertId']);
    }
}
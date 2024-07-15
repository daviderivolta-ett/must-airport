import { DocumentData, DocumentSnapshot } from 'firebase/firestore';
import { VERTICAL } from './vertical.model';

export interface AdditionalLayerStyle {
    fillColor: string;
    strokeColor: string;
}

export class AdditionalLayer {
    id: string;
    name: string;
    fileName: string;
    vertId: VERTICAL;
    geoJson: any;
    style: AdditionalLayerStyle;

    constructor(
        id: string = '',
        name: string = '',
        fileName: string = '',
        vertId: VERTICAL = VERTICAL.Default,
        geoJson: any = {},
        style: AdditionalLayerStyle = {
            fillColor: '#3388ff',
            strokeColor: '#3388ff'
        },
    ) {
        this.id = id;
        this.name = name;
        this.fileName = fileName;
        this.vertId = vertId;
        this.geoJson = geoJson;
        this.style = style;
    }
}

export const additionalLayerConverter = {
    toFirestore: (layer: AdditionalLayer): DocumentData => {
        return {
            name: layer.name,
            fileName: layer.fileName,
            style: layer.style,
            vertId: layer.vertId
        }
    },
    fromFirestore: (snapshot: DocumentSnapshot): AdditionalLayer => {
        const data = snapshot.data();
        if (!data) return new AdditionalLayer();
        return new AdditionalLayer(
            snapshot.id,
            data['name'],
            data['fileName'],
            data['vertId'],
            {},
            data['style']
        );
    }
}
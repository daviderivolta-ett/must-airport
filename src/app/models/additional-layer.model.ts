import { DocumentSnapshot } from 'firebase/firestore';
import { VERTICAL } from './vertical.model';

export interface AdditionalLayerStyle {
    fillColor: string;
    strokeColor: string;
}

export class AdditionalLayerDb {
    name: string;
    fileName: string;
    vertId: VERTICAL;
    style: AdditionalLayerStyle;

    constructor(name: string, fileName: string, vertId: VERTICAL, style: AdditionalLayerStyle = { fillColor: '#3388ff', strokeColor: '#3388ff' }) {
        this.name = name;
        this.fileName = fileName;
        this.vertId = vertId;
        this.style = style;
    }

    static fromAdditionLayer(layer: AdditionalLayer): AdditionalLayerDb {
        return new AdditionalLayerDb(layer.name, layer.fileName, layer.vertId, layer.style);
    }

    static createEmpty(): AdditionalLayer {
        return new AdditionalLayer(
            '',
            '',
            VERTICAL.Default,
            { fillColor: '#3388ff', strokeColor: '#3388ff' },
            '',
            null
        )
    }
}

export const additionalLayerConverter = {
    toFirestore: (layer: AdditionalLayerDb) => {
        return {
            name: layer.name,
            fileName: layer.fileName,
            vertId: layer.vertId,
            style: layer.style
        };
    },
    fromFirestore: (snapshot: DocumentSnapshot, options: any) => {
        const data = snapshot.data(options);
        if (!data) return;
        return new AdditionalLayerDb(data['name'], data['fileName'], data['vertId'], data['style']);
    }
}

export class AdditionalLayer extends AdditionalLayerDb {
    id: string;
    geoJson: any;

    constructor(name: string, fileName: string, vertId: VERTICAL, style: AdditionalLayerStyle = { fillColor: '3388ff', strokeColor: '3388ff' }, id: string, geoJson: any) {
        super(name, fileName, vertId, style);
        this.id = id;
        this.geoJson = geoJson;
    }
}
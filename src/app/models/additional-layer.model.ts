import { DocumentSnapshot} from 'firebase/firestore';
import { VERTICAL } from './app-flow.model';

export class AdditionalLayerDb {
    name: string;
    geoJsonUrl: string;
    vertId: VERTICAL;

    constructor(name: string, geoJsonUrl: string, vertId: VERTICAL) {
        this.name = name;
        this.geoJsonUrl = geoJsonUrl;
        this.vertId = vertId;
    }

    static fromAdditionLayer(layer: AdditionalLayer): AdditionalLayerDb {
        return new AdditionalLayerDb(layer.name, layer.geoJsonUrl, layer.vertId);
    }
}

export const additionalLayerConverter = {
    toFirestore: (layer: AdditionalLayerDb) => {
        return {
            name: layer.name,
            geoJsonUrl: layer.geoJsonUrl,
            vertId: layer.vertId
        };
    },
    fromFirestore: (snapshot: DocumentSnapshot, options: any) => {
        const data = snapshot.data(options);
        if (!data) return;
        return new AdditionalLayerDb(data['name'], data['geoJsonUrl'], data['vertId']);
    }
}

export class AdditionalLayer extends AdditionalLayerDb {
    id: string;
    geoJson: any;

    constructor(name: string, geoJsonUrl: string, vertId: VERTICAL, id: string, geoJson: any) {
        super(name, geoJsonUrl, vertId);
        this.id = id;
        this.geoJson = geoJson;
    }
}
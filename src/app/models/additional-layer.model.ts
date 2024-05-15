import { DocumentSnapshot} from 'firebase/firestore';
import { VERTICAL } from './app-flow.model';

export class AdditionalLayerDb {
    name: string;
    fileName: string;
    vertId: VERTICAL;

    constructor(name: string, fileName: string, vertId: VERTICAL) {
        this.name = name;
        this.fileName = fileName;
        this.vertId = vertId;
    }

    static fromAdditionLayer(layer: AdditionalLayer): AdditionalLayerDb {
        return new AdditionalLayerDb(layer.name, layer.fileName, layer.vertId);
    }
}

export const additionalLayerConverter = {
    toFirestore: (layer: AdditionalLayerDb) => {
        return {
            name: layer.name,
            fileName: layer.fileName,
            vertId: layer.vertId
        };
    },
    fromFirestore: (snapshot: DocumentSnapshot, options: any) => {
        const data = snapshot.data(options);
        if (!data) return;
        return new AdditionalLayerDb(data['name'], data['fileName'], data['vertId']);
    }
}

export class AdditionalLayer extends AdditionalLayerDb {
    id: string;
    geoJson: any;

    constructor(name: string, fileName: string, vertId: VERTICAL, id: string, geoJson: any) {
        super(name, fileName, vertId);
        this.id = id;
        this.geoJson = geoJson;
    }
}
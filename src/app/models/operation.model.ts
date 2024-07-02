import { DocumentData, DocumentSnapshot, Timestamp } from "firebase/firestore";
import { VERTICAL } from "./vertical.model";

export enum OPERATIONTYPE {
    Maintenance = 'maintenance',
    Inspection = 'inspection',
    InspectionHorizontal = 'inspectionHorizontal',
    InspectionVertical = 'inspectionVertical',
}

export class Inspection {
    date: Date;
    id: string;
    linkId: string;
    reportParentId: string;
    operator: string;
    type: OPERATIONTYPE;

    constructor(
        date: Date,
        id: string,
        linkId: string,
        reportParentId: string,
        operator: string,
        type: OPERATIONTYPE
    ) {
        this.date = date;
        this.id = id;
        this.linkId = linkId;
        this.reportParentId = reportParentId;
        this.operator = operator;
        this.type = type;
    }

    static createEmpty(): Inspection {
        return new Inspection(new Date(), '', '', '', '', OPERATIONTYPE.Maintenance);
    }
}

export const inspectionConverter = {
    toFirestore: (inspection: Inspection): DocumentData => {
        return {
            date: inspection.date,
            linkId: inspection.linkId,
            reportParentId: inspection.reportParentId,
            operator: inspection.operator,
            type: inspection.type
        }
    },
    fromFirestore: (snapshot: DocumentSnapshot, options: any) => {
        const data: DocumentData = snapshot.data(options)!;
        return new Inspection(
            (data['date']).toDate(),
            snapshot.id,
            data['linkId'],
            data['reportParentId'],
            data['operator'],
            data['type']
        );
    }
}

export class InspectionLink {
    childFlowId: OPERATIONTYPE;
    reportParentId: string;
    type: string = 'activateChildFlow';
    vertId: string;

    constructor(childFlowId: OPERATIONTYPE, reportParentId: string, vertId: string) {
        this.childFlowId = childFlowId;
        this.reportParentId = reportParentId;
        this.vertId = vertId;
    }

    static createEmpty(): InspectionLink {
        return new InspectionLink(OPERATIONTYPE.Maintenance, '', VERTICAL.Default);
    }
}

export const inspectionLinkConverter = {
    toFirestore: (inspection: InspectionLink): DocumentData => {
        return {
            childFlowId: inspection.childFlowId,
            reportParentId: inspection.reportParentId,
            type: inspection.type,
            verticalId: inspection.vertId
        }
    },
    fromFirestore: (snapshot: DocumentSnapshot, options: any) => {
        const data: DocumentData = snapshot.data(options)!;
        return new InspectionLink(
            data['childFlowId'],
            data['reportParentId'],
            data['verticalId']
        );
    }
}
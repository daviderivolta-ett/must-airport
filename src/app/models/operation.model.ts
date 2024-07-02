import { DocumentData, DocumentSnapshot, Timestamp } from "firebase/firestore";
import { VERTICAL } from "./vertical.model";

export enum OPERATIONTYPE {
    Maintenance = 'maintenance',
    Inspection = 'inspection',
    InspectionHorizontal = 'inspectionHorizontal',
    InspectionVertical = 'inspectionVertical',
}

export class OperationDb {
    date: Timestamp;
    operatorName: string;
    type: string;
    id: string;
    operationLink: string;

    constructor(date: Timestamp, operatorName: string, type: string, id: string, operationLink: string) {
        this.date = date;
        this.operatorName = operatorName;
        this.type = type;
        this.id = id;
        this.operationLink = operationLink;
    }

    static createEmpty(): OperationDb {
        return new OperationDb(Timestamp.now(), '', '', '', '');
    }
}

export class Operation {
    date: Date;
    operatorName: string;
    type: OPERATIONTYPE;
    id: string;
    operationLink: string;

    constructor(date: Date, operatorName: string, type: OPERATIONTYPE, id: string, operationLink: string) {
        this.date = date;
        this.operatorName = operatorName;
        this.type = type;
        this.id = id;
        this.operationLink = operationLink;
    }

    static createEmpty(): Operation {
        return new Operation(new Date(Date.now()), '', OPERATIONTYPE.Maintenance, '', '');
    }
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

export class OperationLinkDb {
    childFlowId: string;
    reportParentId: string;
    type: string;
    verticalId: string;

    constructor(childFlowId: string, reportParentId: string, type: string, verticalId: string) {
        this.childFlowId = childFlowId;
        this.reportParentId = reportParentId;
        this.type = type;
        this.verticalId = verticalId;
    }

    static createEmpty(): OperationLinkDb {
        return new OperationLinkDb('', '', '', '');
    }
}

export class OperationLink {
    childFlowId: OPERATIONTYPE;
    reportParentId: string;
    type: string;
    verticalId: VERTICAL | string;

    constructor(childFlowId: OPERATIONTYPE, reportParentId: string, type: string, verticalId: VERTICAL | string) {
        this.childFlowId = childFlowId;
        this.reportParentId = reportParentId;
        this.type = type;
        this.verticalId = verticalId;
    }

    static createEmpty(): OperationLink {
        return new OperationLink(OPERATIONTYPE.Maintenance, '', 'activateChildFlow', VERTICAL.Default);
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
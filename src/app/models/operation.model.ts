import { Timestamp } from "firebase/firestore";
import { VERTICAL } from "./app-flow.model";

export enum OPERATIONTYPE {
    Maintenance = 'maintenance',
    Inspection = 'inspection'
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
        return new Operation(new Date(Date.now()), '', OPERATIONTYPE.Inspection, '', '');
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
        return new OperationLink(OPERATIONTYPE.Inspection, '', 'activateChildFlow', VERTICAL.Default);
    }
}
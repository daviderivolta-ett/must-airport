import { Timestamp } from "firebase/firestore";

export enum OPERATIONTYPE {
    Intervention = 'intervention',
    Inspection = 'inspection'
}

export class OperationDb {
    date: Timestamp;
    operatorName: string;
    type: string;
    id: string;

    constructor(date: Timestamp, operatorName: string, type: string, id: string) {
        this.date = date;
        this.operatorName = operatorName;
        this.type = type;
        this.id = id;
    }

    static createEmpty(): OperationDb {
        return new OperationDb(Timestamp.now(), '', '', '');
    }
}

export class Operation {
    date: Date;
    operatorName: string;
    type: OPERATIONTYPE;
    id: string;
    
    constructor(date: Date, operatorName: string, type: OPERATIONTYPE, id: string) {
        this.date = date;
        this.operatorName = operatorName;
        this.type = type;
        this.id = id;
    }

    static createEmpty(): Operation {
        return new Operation(new Date(Date.now()), '', OPERATIONTYPE.Inspection, '');
    }
}
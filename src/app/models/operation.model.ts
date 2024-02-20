import { Timestamp } from "firebase/firestore";

export enum OPERATIONTYPE {
    Intervention = 'intervento',
    Inspection = 'ispezione'
}

export class OperationDb {
    date: Timestamp;
    operatorName: string;
    type: string;

    constructor(date: Timestamp, operatorName: string, type: string) {
        this.date = date;
        this.operatorName = operatorName;
        this.type = type;
    }

    static createEmpty(): OperationDb {
        return new OperationDb(Timestamp.now(), '', '');
    }
}

export class Operation {
    date: Date;
    operatorName: string;
    type: OPERATIONTYPE;
    
    constructor(date: Date, operatorName: string, type: OPERATIONTYPE) {
        this.date = date;
        this.operatorName = operatorName;
        this.type = type;
    }

    static createEmpty(): Operation {
        return new Operation(new Date(Date.now()), '', OPERATIONTYPE.Inspection);
    }
}
import { Timestamp } from "firebase/firestore";
import { APPFLOW } from "./app-flow.model";

export class Code {
    code: string;
    creationDate: Date;
    isValid: boolean;
    vertId: APPFLOW;
    usedOn: Date | null;
    userId: string | null

    constructor(
        code: string,
        creationDate: Date,
        isValid: boolean,
        vertId: APPFLOW,
        usedOn: Date | null,
        userId: string | null
    ) {
        this.code = code;
        this.creationDate = creationDate;
        this.isValid = isValid;
        this.vertId = vertId;
        this.usedOn = usedOn;
        this.userId = userId;
    }

    static createEmpty(): Code {
        return new Code(
            '',
            new Date(Date.now()),
            true,
            APPFLOW.Default,
            null,
            null
        );
    }
}

export class CodeDb {
    code: string;
    creationDate: Timestamp;
    isValid: boolean;
    vertId: string;
    usedOn: Timestamp | null;
    userId: string | null;

    constructor(
        code: string,
        creationDate: Timestamp,
        isValid: boolean,
        vertId: string,
        usedOn: Timestamp | null,
        userId: string | null
    ) {
        this.code = code;
        this.creationDate = creationDate;
        this.isValid = isValid;
        this.vertId = vertId;
        this.usedOn = usedOn;
        this.userId = userId;
    }

    static createEmpty() {
        return new CodeDb(
            '',
            Timestamp.now(),
            true,
            'default',
            null,
            null
        )
    }
}
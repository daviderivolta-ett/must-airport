import { Timestamp } from "firebase/firestore";
import { APPFLOW } from "./app-flow.model";

export class Code {
    code: string;
    isValid: boolean;
    app: APPFLOW;
    usedOn: Date | null;
    userId: string | null

    constructor(
        code: string,
        isValid: boolean,
        app: APPFLOW,
        usedOn: Date | null,
        userId: string | null
    ) {
        this.code = code;
        this.isValid = isValid;
        this.app = app;
        this.usedOn = usedOn;
        this.userId = userId;
    }

    static createEmpty(): Code {
        return new Code(
            '',
            true,
            APPFLOW.Default,
            null,
            null
        );
    }
}

export class CodeDb {
    code: string;
    isValid: boolean;
    app: string;
    usedOn: Timestamp | null;
    userId: string | null;

    constructor(
        code: string,
        isValid: boolean,
        app: string,
        usedOn: Timestamp | null,
        userId: string | null
    ) {
        this.code = code;
        this.isValid = isValid;
        this.app = app;
        this.usedOn = usedOn;
        this.userId = userId;
    }

    static createEmpty() {
        return new CodeDb(
            '',
            false,
            'default',
            null,
            null
        )
    }
}
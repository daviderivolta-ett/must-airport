import { Timestamp } from "firebase/firestore";
import { VERTICAL } from "./vertical.model";
import { APPTYPE } from "./app-type.mode";

export class Code {
    code: string;
    creationDate: Date;
    isValid: boolean;
    vertId: VERTICAL;
    appType: APPTYPE;
    usedOn: Date | null;
    userId: string | null;
    userEmail: string | null;

    constructor(
        code: string,
        creationDate: Date,
        isValid: boolean,
        vertId: VERTICAL,
        appType: APPTYPE,
        usedOn: Date | null,
        userId: string | null,
        userEmail: string | null,
    ) {
        this.code = code;
        this.creationDate = creationDate;
        this.isValid = isValid;
        this.vertId = vertId;
        this.appType = appType;
        this.usedOn = usedOn;
        this.userId = userId;
        this.userEmail = userEmail;
    }

    static createEmpty(): Code {
        return new Code(
            '',
            new Date(Date.now()),
            true,
            VERTICAL.Default,
            APPTYPE.Web,
            null,
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
    associatedOn: Timestamp | null;
    user: string | null;
    userEmail: string | null;

    constructor(
        code: string,
        creationDate: Timestamp,
        isValid: boolean,
        vertId: string,
        associatedOn: Timestamp | null,
        user: string | null,
        userEmail: string | null
    ) {
        this.code = code;
        this.creationDate = creationDate;
        this.isValid = isValid;
        this.vertId = vertId;
        this.associatedOn = associatedOn;
        this.user = user;
        this.userEmail = userEmail;
    }

    static createEmpty() {
        return new CodeDb(
            '',
            Timestamp.now(),
            true,
            'default',
            null,
            null,
            null
        )
    }
}
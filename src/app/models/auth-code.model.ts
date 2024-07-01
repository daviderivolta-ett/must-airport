import { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { VERTICAL } from './vertical.model';
import { APPTYPE } from './app-type.mode';

export class AuthCode {
    code: string;
    isValid: boolean;
    vertId: VERTICAL;
    appType: APPTYPE = APPTYPE.Web;
    user: string | null = null;
    associatedOn: Date | null = null;

    constructor(
        code: string,
        isValid: boolean,
        vertId: VERTICAL,
    ) {
        this.code = code;
        this.isValid = isValid;
        this.vertId = vertId;
    }

    static createEmpty(): AuthCode {
        return new AuthCode(
            '',
            true,
            VERTICAL.Default
        );
    }
}

export const authCodeConverter = {
    toFirestore: (authCode: AuthCode): DocumentData => {
        const c: any = {};

        c.code = authCode.code;
        c.isValid = authCode.isValid;
        c.vertId = authCode.vertId;

        if (authCode.appType) c.appType = authCode.appType;
        if (authCode.user) c.user = authCode.user;
        if (authCode.associatedOn) c.associatedOn = authCode.associatedOn;

        return c;
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): AuthCode => {
        const data: DocumentData = snapshot.data(options)!;

        const authCode: AuthCode = new AuthCode(
            data['code'],
            data['isValid'],
            data['vertId']
        );

        if (data['user']) authCode.user = data['user'];
        if (data['associatedOn']) authCode.associatedOn = data['associatedOn'].toDate();
        return authCode;
    }
}
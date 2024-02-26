import { Timestamp } from "firebase/firestore";

export enum USERLEVEL {
    Admin = 0
}

export interface UserData {
    userLevel: USERLEVEL;
    lastLogin: Timestamp;
}

export class LoggedUser {
    level: UserData['userLevel'];
    lastLogin: Date;
    email: string | null;
    displayName: string | null;
    picUrl: string | null;

    constructor(level: USERLEVEL, lastLogin: Date, email: string | null, displayName: string | null, picUrl: string | null) {
        this.level = level;
        this.lastLogin = lastLogin;
        this.email = email;
        this.displayName = displayName;
        this.picUrl = picUrl;
    }

    static createEmpty(): LoggedUser {
        return new LoggedUser(
            USERLEVEL.Admin,
            new Date(Date.now()),
            null,
            null,
            null
        );
    }
}
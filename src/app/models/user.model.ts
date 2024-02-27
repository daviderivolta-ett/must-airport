import { Timestamp } from "firebase/firestore";
import { APPFLOW } from "./app-flow.model";

export enum USERLEVEL {
    Admin = 0
}

export interface UserData {
    userLevel: USERLEVEL;
    lastLogin: Timestamp;
    apps: APPFLOW[]
}

export class LoggedUser {
    level: UserData['userLevel'];
    lastLogin: Date;
    email: string | null;
    displayName: string | null;
    picUrl: string | null;
    apps: APPFLOW[]

    constructor(
        level: USERLEVEL,
        lastLogin: Date,
        email: string | null,
        displayName: string | null,
        picUrl: string | null,
        apps: APPFLOW[]
    ) {
        this.level = level;
        this.lastLogin = lastLogin;
        this.email = email;
        this.displayName = displayName;
        this.picUrl = picUrl;
        this.apps = apps
    }

    static createEmpty(): LoggedUser {
        return new LoggedUser(
            USERLEVEL.Admin,
            new Date(Date.now()),
            null,
            null,
            null,
            [APPFLOW.Default]
        );
    }
}
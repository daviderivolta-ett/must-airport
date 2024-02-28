import { Timestamp } from "firebase/firestore";
import { APPFLOW } from "./app-flow.model";

export enum USERLEVEL {
    Superuser = 0,
    Admin = 1,
    User = 2
}

export interface UserData {
    userLevel: USERLEVEL;
    lastLogin: Timestamp;
    apps: APPFLOW[],
    lastApp: APPFLOW
}

export class LoggedUser {
    level: UserData['userLevel'];
    lastLogin: Date;
    email: string | null;
    displayName: string | null;
    picUrl: string | null;
    apps: APPFLOW[];
    lastApp: APPFLOW;
    id: string;

    constructor(
        level: USERLEVEL,
        lastLogin: Date,
        email: string | null,
        displayName: string | null,
        picUrl: string | null,
        apps: APPFLOW[],
        lastApp: APPFLOW,
        id: string
    ) {
        this.level = level;
        this.lastLogin = lastLogin;
        this.email = email;
        this.displayName = displayName;
        this.picUrl = picUrl;
        this.apps = apps;
        this.lastApp = lastApp;
        this.id = id;
    }

    static createEmpty(): LoggedUser {
        return new LoggedUser(
            USERLEVEL.User,
            new Date(Date.now()),
            null,
            null,
            null,
            [APPFLOW.Default],
            APPFLOW.Default,
            ''
        );
    }
}
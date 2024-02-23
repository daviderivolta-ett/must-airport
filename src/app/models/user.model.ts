export enum USERLEVEL {
    Admin = 0
}

export interface UserData {
    userLevel: USERLEVEL;
}

export class LoggedUser {
    level: UserData['userLevel'];
    lastLogin: Date;
    email: string | null;

    constructor(level: USERLEVEL, lastLogin: Date, email: string | null) {
        this.level = level;
        this.lastLogin = lastLogin;
        this.email = email;
    }

    static createEmpty(): LoggedUser {
        return new LoggedUser(USERLEVEL.Admin, new Date(Date.now()), null);
    }
}
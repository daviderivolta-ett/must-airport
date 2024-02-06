import { Timestamp } from "firebase/firestore";

export class Report {
    closure: boolean;
    creationTime: Date;
    description: string;
    flowId: string;
    detailPics: string[];
    language: string;
    parentId: string;
    userId: string;
    verticalId: string;

    constructor(
        closure: boolean,
        creationTime: Timestamp,
        description: string,
        flowId: string,
        detailPics: string[],
        language: string,
        parentId: string,
        userId: string,
        verticalId: string
    ) {
        this.closure = closure;
        this.creationTime = creationTime.toDate();
        this.description = description;
        this.flowId = flowId;
        this.detailPics = detailPics;
        this.language = language;
        this.parentId = parentId;
        this.userId = userId;
        this.verticalId = verticalId;
    }

    static createEmpty(): Report {
        return new Report(
            false,
            Timestamp.now(),
            '',
            '',
            [],
            '',
            '',
            '',
            ''
        )
    }
}
import { Timestamp } from "firebase/firestore";

export class ReportChild {
    closure: boolean;
    comment?: string;
    creationTime: Date;
    flowId: string;
    detailPics: string[];
    language: string;
    parentId: string;
    subTagFailure: string[];
    tagFailure: string[];
    userId: string;
    verticalId: string;

    constructor(
        closure: boolean,
        comment: string,
        creationTime: Timestamp,
        flowId: string,
        detailPics: string[],
        language: string,
        parentId: string,
        subTagFailure: string[],
        tagFailure: string[],
        userId: string,
        verticalId: string
    ) {
        this.closure = closure;
        this.comment = comment || '-';
        this.creationTime = creationTime.toDate();
        this.flowId = flowId;
        this.detailPics = detailPics;
        this.language = language;
        this.parentId = parentId;
        this.subTagFailure = subTagFailure;
        this.tagFailure = tagFailure;
        this.userId = userId;
        this.verticalId = verticalId;
    }

    static createEmpty(): ReportChild {
        return new ReportChild(
            false,
            '-',
            Timestamp.now(),
            '',
            [],
            '',
            '',
            [],
            [],
            '',
            ''
        )
    }
}
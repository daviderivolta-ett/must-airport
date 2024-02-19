import { Timestamp } from "firebase/firestore";
import { FailureTag } from "./failure-tag.model";
import { FailureSubTag } from "./failure-subtag.model";

export class ReportChild {
    closure: boolean;
    comment?: string;
    creationTime: Date;
    flowId: string;
    detailPics: string[];
    language: string;
    parentId: string;
    subTagFailure: string[] | FailureSubTag[];
    tagFailure: string[] | FailureTag[];
    userId: string;
    verticalId: string;
    id: string;

    constructor(
        closure: boolean,
        comment: string,
        creationTime: Timestamp,
        flowId: string,
        detailPics: string[],
        language: string,
        parentId: string,
        subTagFailure: string[] | FailureSubTag[],
        tagFailure: string[] | FailureTag[],
        userId: string,
        verticalId: string,
        id: string
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
        this.id = id
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
            '',
            ''
        )
    }
}
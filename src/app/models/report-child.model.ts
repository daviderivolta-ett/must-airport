import { Timestamp } from "firebase/firestore";
import { ReportChildFields } from "./report-child.fields.model";
import { LANGUAGE } from "./language.model";
import { ReportTagGroup } from "./tag.model";

export class ReportChild {
    isClosed: boolean;
    creationTime: Date;
    fields: any;
    flowId: string;
    language: LANGUAGE;
    parentId: string;
    userId: string;
    verticalId: string;
    id: string;
    tags?: ReportTagGroup[]

    constructor(
        isClosed: boolean,
        creationTime: Timestamp,
        fields: any,
        flowId: string,
        language: LANGUAGE,
        parentId: string,
        userId: string,
        verticalId: string,
        id: string
    ) {
        this.isClosed = isClosed;
        this.creationTime = creationTime.toDate();
        this.fields = fields;
        this.flowId = flowId;
        this.language = language;
        this.parentId = parentId;
        this.userId = userId;
        this.verticalId = verticalId;
        this.id = id
    }

    static createEmpty(): ReportChild {
        return new ReportChild(
            false,
            Timestamp.now(),
            // ReportChildFields.createEmpty(),
            {},
            '',
            LANGUAGE.Italian,
            '',
            '',
            '',
            ''
        )
    }
}
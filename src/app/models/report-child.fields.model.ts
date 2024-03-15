import { FailureSubTag } from "./failure-subtag.model";
import { FailureTag } from "./failure-tag.model";

export class ReportChildFields {
    detailShots: string[];
    description: string;
    tagFailure: string[] | FailureTag[];
    subTagFailure: string[] | FailureSubTag[];

    constructor(detailShots: string[], description: string, tagFailure: string[] | FailureTag[], subTagFailure: string[] | FailureSubTag[]) {
        this.detailShots = detailShots;
        this.description = description;
        this.tagFailure = tagFailure;
        this.subTagFailure = subTagFailure;
    }

    static createEmpty(): ReportChildFields {
        return new ReportChildFields([], '', [], []);
    }
}
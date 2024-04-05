import { FailureSubTag } from "./failure-subtag.model";
import { FailureTag } from "./failure-tag.model";
import { Tag } from "./tag.model";

export class ReportChildFields {
    detailShots: string[];
    description: string;
    tagFailure: string[] | FailureTag[];
    subTagFailure: string[] | FailureSubTag[];
    childFlowTags1: Tag[];
    childFlowTags2: Tag[];

    constructor(detailShots: string[], description: string, tagFailure: string[] | FailureTag[], subTagFailure: string[] | FailureSubTag[], childFlowTags1: Tag[], childFlowTags2: Tag[]) {
        this.detailShots = detailShots;
        this.description = description;
        this.tagFailure = tagFailure;
        this.subTagFailure = subTagFailure;
        this.childFlowTags1 = childFlowTags1;
        this.childFlowTags2 = childFlowTags2;
    }

    static createEmpty(): ReportChildFields {
        return new ReportChildFields([], '', [], [], [], []);
    }
}
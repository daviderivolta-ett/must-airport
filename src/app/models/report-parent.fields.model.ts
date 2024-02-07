import { TechElementSubTag } from "./tech-element-subtag.model";
import { TechElementTag } from "./tech-element-tag.model";

export class ReportParentFields {
    wideShots: string[];
    elementType: string[]
    tagTechElement: string[] | TechElementTag[];
    subTagTechElement: string[] | TechElementSubTag[];

    constructor(wideShots: string[], elementType: string[], tagTechElement: string[], subTagTechElement: string[]) {
        this.wideShots = wideShots;
        this.elementType = elementType;
        this.tagTechElement = tagTechElement;
        this.subTagTechElement = subTagTechElement;
    }

    static createEmpty(): ReportParentFields {
        return new ReportParentFields([], [], [], []);
    }
}
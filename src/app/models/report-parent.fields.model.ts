import { TechElementTag } from "./tech-element-tag.model";

export class ReportParentFields {
    wideShots: string[];
    elementType: string[]
    tagTechElement: TechElementTag[] | string[];
    subTagTechElement: string[];

    constructor(wideShots: string[], elementType: string[], tagTechElement: string[] | TechElementTag[], subTagTechElement: string[]) {
        this.wideShots = wideShots;
        this.elementType = elementType;
        this.tagTechElement = tagTechElement;
        this.subTagTechElement = subTagTechElement;
    }

    static createEmpty(): ReportParentFields {
        return new ReportParentFields([], [], [], []);
    }
}
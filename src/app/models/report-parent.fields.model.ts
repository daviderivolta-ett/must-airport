import { Tag } from "./tag.model";
import { TechElementSubTag } from "./tech-element-subtag.model";
import { TechElementTag } from "./tech-element-tag.model";

export class ReportParentFields {
    wideShots: string[];
    elementType: string[];
    tagTechElement: TechElementTag[] | string[];
    subTagTechElement: TechElementSubTag[] | string[];
    parentFlowTags1: Tag[];
    parentFlowTags2: Tag[];

    constructor(wideShots: string[], elementType: string[], tagTechElement: string[] | TechElementTag[], subTagTechElement: string[] | TechElementSubTag[], parentFlowTags1: Tag[], parentFlowTags2: Tag[]) {
        this.wideShots = wideShots;
        this.elementType = elementType;
        this.tagTechElement = tagTechElement;
        this.subTagTechElement = subTagTechElement;
        this.parentFlowTags1 = parentFlowTags1;
        this.parentFlowTags2 = parentFlowTags2;
    }

    static createEmpty(): ReportParentFields {
        return new ReportParentFields([], [], [], [], [], []);
    }
}
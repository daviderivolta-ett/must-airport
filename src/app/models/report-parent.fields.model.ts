export class ReportParentFields {
    wideShots: string[];
    elementType: string[]
    tagTechElement: string[];
    subTagTechElement: string[];

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
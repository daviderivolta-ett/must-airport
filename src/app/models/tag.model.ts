export class Tag {
    id: string;
    name: string;
    description: string;
    type: string;
    subTags: Tag[];

    constructor(
        id: string,
        name: string,
        description: string,
        type: string,
        subTags: Tag[]
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;
        this.subTags = subTags;
    }

    static createEmpty(): Tag {
        return new Tag('', '', '', '', []);
    }
}

export class TagGroup {
    id: string;
    name: string;
    subGroup: TagGroup | null;

    constructor(id: string, name: string, subGroup: TagGroup | null) {
        this.id = id;
        this.name = name;
        this.subGroup = subGroup;
    }
}

export interface TagDb {
    id: string;
    name: string;
    description: string;
    options: any[];
}

export class ReportTagGroup {
    id: string;
    name: string;
    elements: ReportTag[];
    order: number;

    constructor(id: string, name: string, elements: ReportTag[], order: number) {
        this.id = id;
        this.name = name;
        this.elements = elements;
        this.order = order;
    }
}

export class ReportTag {
    id: string;
    name: string;
    description: string;

    constructor(id: string, name: string, description: string) {
        this.id = id;
        this.name = name;
        this.description = description;
    }
}
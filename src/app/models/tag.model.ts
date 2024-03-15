export class Tag {
    id: string;
    name: string;
    description: string;
    type: string;
    options: Tag[];

    constructor(
        id: string,
        name: string,
        description: string,
        type: string,
        options: Tag[]
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;
        this.options = options
    }

    static createEmpty(): Tag {
        return new Tag('', '', '', '', []);
    }

    static fromType(type: string): Tag {
        return new Tag('', '', '', type, []);
    }
}

export interface TagDb {
    id: string;
    name: string;
    description: string;
    options: any[];
}
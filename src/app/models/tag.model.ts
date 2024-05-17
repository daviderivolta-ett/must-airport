export class Tag {
    id: string;
    name: string;
    description: string;
    type?: string;
    label: string;
    options: Tag[];
    depth?: number;

    constructor(
        id: string,
        name: string,
        description: string,
        type: string,
        label: string,
        options: Tag[],
        depth: number = 1
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;
        this.label = label;
        this.options = options;
        this.depth = depth;
    }

    static createEmpty(): Tag {
        return new Tag('', '', '', '', '', []);
    }

    static fromType(type: string): Tag {
        return new Tag('', '', '', type, '', []);
    }

    public equals(other: Tag): boolean {
        return (
            this.id === other.id &&
            this.name === other.name &&
            this.description === other.description &&
            this.type === other.type &&
            this.label === other.label &&
            this.options.length === other.options.length &&
            this.options.every((option, index) => option.equals(other.options[index]))
        );
    }
}

export interface TagDb {
    id: string;
    name: string;
    description: string;
    options: any[];
}
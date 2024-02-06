interface description {
    it: string;
    en: string;
}

interface name {
    it: string;
    en: string;
}

export class TechElementSubTag {
    description: description;
    id: string;
    name: name;

    constructor(
        description: description,
        id: string,
        name: name
    ) {
        this.description = description;
        this.id = id;
        this.name = name;
    }

    static createEmpty(): TechElementSubTag {
        return new TechElementSubTag(
            { it: '', en: '' },
            '',
            { it: '', en: '' }
        )
    }
}
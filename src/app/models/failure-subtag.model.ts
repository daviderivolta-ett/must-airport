interface description {
    it: string;
    en: string;
}

interface name {
    it: string;
    en: string;
}

export class FailureSubTag {
    description?: description;
    id: string;
    imageUrls: string[];
    name: name;

    constructor(
        description: description,
        id: string,
        imageUrls: string[],
        name: name,
    ) {
        this.description = description;
        this.id = id;
        this.imageUrls = imageUrls;
        this.name = name;
    }

    static createEmpty() {
        return new FailureSubTag(
            { it: '', en: '' },
            '',
            [],
            { it: '', en: '' }
        )
    }
}
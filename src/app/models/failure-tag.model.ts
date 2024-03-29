interface name {
    it: string;
    en:string;
}

interface description {
    it: string;
    en: string;
}

export class FailureTag {
    categoryId: string;
    description: description;
    id: string;
    imageUrls: string[];
    name: name;
    subTags: any[];

    constructor(
        categoryId: string,
        description: description,
        id: string,
        imageUrls: string[],
        name: name,
        subTags: any[]
    ) {
        this.categoryId = categoryId;
        this.description = description;
        this.id = id;
        this.imageUrls = imageUrls;
        this.name = name;
        this.subTags = subTags;
    }

    static createEmpty(): FailureTag {
        return new FailureTag(
            '',
            { it: '', en: '' },
            '',
            [],
            { it: '', en: '' },
            []
        )
    }
}
interface description {
    it: string;
    en: string;
}

interface name {
    it: string;
    en: string;
}

export class TechElementTag {
    categoryId: string;
    description: description;
    id: string;
    name: name;
    subCategoryId: string;
    subTags: any[];

    constructor(
        categoryId: string,
        description: description,
        id: string,
        name: name,
        subCategoryId: string,
        subTags: any[]
    ) {
        this.categoryId = categoryId;
        this.description = description;
        this.id = id;
        this.name = name;
        this.subCategoryId = subCategoryId;
        this.subTags = subTags;
    }

    static createEmpty(): TechElementTag {
        return new TechElementTag(
            '',
            { it: '', en: '' },
            '',
            { it: '', en: '' },
            '',
            []
        )
    }
}
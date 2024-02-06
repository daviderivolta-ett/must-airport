import { FailureSubTag } from "./failure-subtag.model";

export class FailureTag {
    categoryId: string;
    descriptionIt: string;
    descriptionEn: string;
    id: string;
    imageUrls: string[];
    nameIt: string;
    nameEn: string;
    subTags: FailureSubTag[];

    constructor(
        categoryId: string,
        descriptionIt: string,
        descriptionEn: string,
        id: string,
        imageUrls: string[],
        nameIt: string,
        nameEn: string,
        subTags: FailureSubTag[]
    ) {
        this.categoryId = categoryId;
        this.descriptionIt = descriptionIt;
        this.descriptionEn = descriptionEn;
        this.id = id;
        this.imageUrls = imageUrls;
        this.nameIt = nameIt;
        this.nameEn = nameEn;
        this.subTags = subTags;
    }

    static createEmpty(): FailureTag {
        return new FailureTag(
            '',
            '',
            '',
            '',
            [],
            '',
            '',
            []
        )
    }
}
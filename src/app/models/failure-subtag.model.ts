export class FailureSubTag {
    descriptionIt?: string;
    descriptionEn?: string;
    id: string;
    imageUrls: string[];
    nameIt: string;
    nameEn: string;

    constructor(
        descriptionIt: string,
        descriptionEn: string,
        id: string,
        imageUrls: string[],
        nameIt: string,
        nameEn: string
    ) {
        this.descriptionIt = descriptionIt;
        this.descriptionEn = descriptionEn;
        this.id = id;
        this.imageUrls = imageUrls;
        this.nameIt = nameIt;
        this.nameEn = nameEn
    }

    static createEmpty() {
        return new FailureSubTag(
            '',
            '',
            '',
            [],
            '',
            ''
        )
    }
}